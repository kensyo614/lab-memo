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
