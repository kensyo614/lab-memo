import type {AuthInfo} from "@modelcontextprotocol/server"
import {createClient} from "@supabase/supabase-js"
import {createMcpHandler, withMcpAuth} from "mcp-handler"
import {z} from "zod"

import prisma from "@/lib/prisma"
import {SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL} from "@/lib/supabase/env"

function getUserId(authInfo: AuthInfo | undefined): string | null {
    const userId = authInfo?.extra?.userId
    return typeof userId === "string" ? userId : null
}

function errorResult(message: string) {
    return {
        content: [{type: "text" as const, text: message}],
        isError: true,
    }
}

function buildSnippet(note: string | null, words: string[]): string | null {
    if (!note) {
        return null
    }

    const lower = note.toLowerCase()
    const index =
        words
            .map((word) => lower.indexOf(word.toLowerCase()))
            .find((i) => i >= 0) ?? 0

    const start = Math.max(0, index - 40)
    const end = Math.min(note.length, index + 100)
    const prefix = start > 0 ? "…" : ""
    const suffix = end < note.length ? "…" : ""
    return prefix + note.slice(start, end) + suffix
}

const handler = createMcpHandler((server) => {
    server.registerTool(
        "list_tags",
        {
            title: "タグ一覧",
            description: "登録されているタグと各タグがついた資料の件数を返す",
            inputSchema: z.object({}),
        },
        async (_args, ctx) => {
            const userId = getUserId(ctx.http?.authInfo)
            if (!userId) {
                return errorResult("認証されていません。")
            }

            const tags = await prisma.tag.findMany({
                where: {user_id: userId},
                orderBy: {name: "asc"},
                include: {_count: {select: {resourceTags: true}}},
            })

            const result = {
                tags: tags.map((tag) => ({
                    name: tag.name,
                    count: tag._count.resourceTags,
                })),
            }

            return {
                content: [{type: "text" as const, text: JSON.stringify(result)}],
            }
        },
    )

    server.registerTool(
        "search_resources",
        {
            title: "資料の検索",
            description:
                "登録した資料をタイトル・メモ・タグ名から検索する。" +
                "queryは空白区切りで複数語を渡してください，一致した語が多い順に返す。" +
                "部分一致のため言い換えは効かない。" +
                "0件のときはlist_tagsで実際に使われているタグを確認すること。" +
                "本文や全文が必要なときはget_resourceを使う。",
            inputSchema: z.object({
                query: z
                    .string()
                    .optional()
                    .describe("検索語。空白区切りで複数語を渡せる。部分一致"),
                tag: z
                    .string()
                    .optional()
                    .describe("タグ名で絞り込む（完全一致）"),
                type: z
                    .enum(["PDF", "MD", "WEB", "VIDEO", "GITHUB", "OTHER"])
                    .optional()
                    .describe("資料の種類で絞り込む"),
                limit: z
                    .number()
                    .int()
                    .min(1)
                    .max(50)
                    .optional()
                    .describe("返す件数の上限。既定は20"),
            }),
        },
        async ({query, tag, type, limit}, ctx) => {
            const userId = getUserId(ctx.http?.authInfo)
            if (!userId) {
                return errorResult("認証されていません。")
            }

            const words = (query ?? "").split(/\s+/).filter((word) => word !== "")

            const resources = await prisma.resource.findMany({
                where: {
                    user_id: userId,
                    resource_type: type,
                    resourceTags: tag ? {some: {tag: {name: tag}}} : undefined,
                    OR: words.length > 0
                        ? words.flatMap((word) => [
                              {title: {contains: word, mode: "insensitive" as const}},
                              {note: {contains: word, mode: "insensitive" as const}},
                              {
                                  resourceTags: {
                                      some: {
                                          tag: {
                                              name: {contains: word, mode: "insensitive" as const},
                                          },
                                      },
                                  },
                              },
                          ])
                        : undefined,
                },
                orderBy: {created_at: "desc"},
                include: {resourceTags: {include: {tag: true}}},
            })

            const scored = resources.map((resource) => {
                const tagNames = resource.resourceTags.map((rt) => rt.tag.name)
                const haystack = [resource.title, resource.note ?? "", ...tagNames]
                    .join("\n")
                    .toLowerCase()
                const matchedWords = words.filter((word) =>
                    haystack.includes(word.toLowerCase()),
                )
                return {resource, tagNames, matchedWords}
            })

            scored.sort((a, b) => b.matchedWords.length - a.matchedWords.length)

            const limited = scored.slice(0, limit ?? 20)

            const result = {
                results: limited.map(({resource, tagNames, matchedWords}) => ({
                    id: resource.resource_id,
                    title: resource.title,
                    type: resource.resource_type,
                    tags: tagNames,
                    snippet: buildSnippet(resource.note, matchedWords),
                    matchedWords,
                    matchCount: matchedWords.length,
                })),
                total: scored.length,
                returned: limited.length,
                truncated: scored.length > limited.length,
            }

            return {
                content: [{type: "text" as const, text: JSON.stringify(result)}],
            }
        },
    )
})

async function verifyToken(
    _req: Request,
    bearerToken?: string,
): Promise<AuthInfo | undefined> {
    if (!bearerToken) {
        return undefined
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {persistSession: false, autoRefreshToken: false},
    })

    const {data, error} = await supabase.auth.getClaims(bearerToken)
    if (error || !data) {
        return undefined
    }

    const {sub, client_id} = data.claims

    return {
        token: bearerToken,
        clientId: typeof client_id === "string" ? client_id : "",
        scopes: [],
        extra: {userId: sub},
    }
}

const authHandler = withMcpAuth(handler, verifyToken, {
    required: true,
    resourceMetadataPath: "/.well-known/oauth-protected-resource",
})

export {authHandler as GET, authHandler as POST}
