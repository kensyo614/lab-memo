import type {AuthInfo} from "@modelcontextprotocol/server"
import {createClient} from "@supabase/supabase-js"
import {createMcpHandler, withMcpAuth} from "mcp-handler"
import {revalidatePath} from "next/cache"
import {z} from "zod"

import prisma from "@/lib/prisma"
import {SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL} from "@/lib/supabase/env"
import {createResourceForUser} from "@/lib/resourceService"

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

const MAX_CONTENT_SIZE = 1024 * 1024

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

    server.registerTool(
        "get_resource",
        {
            title: "資料の取得",
            description:
                "資料を1件取得し，メモの全文と詳細を返す。" +
                "idにはsearch_resourcesの結果に含まれるidをそのまま渡す。" +
                "種類がMDのときは，ファイルの本文もcontentに含める。" +
                "PDFなど他のファイルの本文は取得できない（contentはnull）。",
            inputSchema: z.object({
                id: z
                    .string()
                    .describe("search_resourcesの結果に含まれる資料のid"),
            }),
        },
        async ({id}, ctx) => {
            const authInfo = ctx.http?.authInfo
            const userId = getUserId(authInfo)
            if (!userId || !authInfo) {
                return errorResult("認証されていません。")
            }

            const resource = await prisma.resource.findFirst({
                where: {user_id: userId, resource_id: id},
                include: {resourceTags: {include: {tag: true}}},
            })
            if (!resource) {
                return errorResult(
                    "指定されたidの資料が見つかりませんでした。search_resourcesでidを確認してください。",
                )
            }

            let content: string | null = null
            let contentNote: string | null = null

            if (resource.resource_type === "MD" && resource.file_path) {
                const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
                    auth: {persistSession: false, autoRefreshToken: false},
                    global: {headers: {Authorization: `Bearer ${authInfo.token}`}},
                })

                const {data, error} = await supabase.storage
                    .from("resources")
                    .download(resource.file_path)

                if (error || !data) {
                    console.error(error)
                    contentNote = "ファイルの本文を取得できませんでした。"
                } else if (data.size > MAX_CONTENT_SIZE) {
                    contentNote = "ファイルが大きすぎるため本文は省略しました。"
                } else {
                    content = await data.text()
                }
            }

            const result = {
                id: resource.resource_id,
                title: resource.title,
                type: resource.resource_type,
                url: resource.url,
                fileName: resource.file_name,
                tags: resource.resourceTags.map((rt) => rt.tag.name),
                note: resource.note,
                content,
                contentNote,
                createdAt: resource.created_at.toISOString(),
            }

            return {
                content: [{type: "text" as const, text: JSON.stringify(result)}],
            }
        },
    )

    server.registerTool(
        "create_resource",
        {
            title: "情報の登録",
            description:
                "URLの資料（Webページ・動画・GitHub）を新しく登録する。" +
                "PDFやMarkdownなどのファイルは登録できない。" +
                "同じURLがすでに登録されていれば，新しく作らず既存の資料を返す（created: false）。" +
                "タグを付けるときは，先にlist_tagsで既存のタグ名を確認し，" +
                "表記の揺れで似たタグを増やさないよう，なるべく既存の名前を使うこと。",
            inputSchema: z.object({
                title: z
                    .string()
                    .describe("資料のタイトル"),
                url: z
                    .string()
                    .describe("資料のURL。httpまたはhttpsで始まるもの"),
                type: z
                    .enum(["WEB", "VIDEO", "GITHUB"])
                    .describe("資料の種類。WebページはWEB，動画はVIDEO，GitHubのリポジトリはGITHUB"),
                tags: z
                    .array(z.string())
                    .optional()
                    .describe("付けるタグ名の配列。同じ名前のタグがなければ新しく作る"),
                note: z
                    .string()
                    .optional()
                    .describe("資料に付けるメモ"),
            }),
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
            },
        },
        async ({title, url, type, tags, note}, ctx) => {
            const authInfo = ctx.http?.authInfo
            const userId = getUserId(authInfo)

            if (!userId || !authInfo) {
                return errorResult("認証されていません。")
            }

            const trimmedUrl = url.trim()
            let parsedUrl: URL
            try {
                parsedUrl = new URL(trimmedUrl)
            } catch {
                return errorResult("URLの形式が正しくありません。")
            }
            if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
                return errorResult("URLはhttpまたはhttpsで始まるものだけ登録できます。")
            }

            const existing = await prisma.resource.findFirst({
                where: {user_id: userId, url: trimmedUrl},
                include: {resourceTags: {include: {tag: true}}},
            })
            if (existing) {
                const result = {
                    id: existing.resource_id,
                    title: existing.title,
                    url: existing.url,
                    type: existing.resource_type,
                    tags: existing.resourceTags.map((rt) => rt.tag.name),
                    created: false,
                }
                return {
                    content: [{type: "text" as const, text: JSON.stringify(result)}],
                }
            }

            const created = await createResourceForUser(userId, {
                title,
                resourceType: type,
                url: trimmedUrl,
                filePath: "",
                fileName: "",
                note: note ?? "",
                tagIds: [],
                tagNames: tags ?? [],
            })

            if ("error" in created) {
                return errorResult(created.error)
            }

            revalidatePath("/")

            const resource = await prisma.resource.findFirst({
                where: {user_id: userId, resource_id: created.resourceId},
                include: {resourceTags: {include: {tag: true}}},
            })

            const result = {
                id: created.resourceId,
                title: resource?.title ?? title,
                url: resource?.url ?? trimmedUrl,
                type,
                tags: resource?.resourceTags.map((rt) => rt.tag.name) ?? [],
                created: true,
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
