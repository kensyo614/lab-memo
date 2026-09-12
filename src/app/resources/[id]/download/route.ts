import type { NextRequest } from "next/server"

import { requireUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(
    _request: NextRequest,
    {params}: RouteContext<'/resources/[id]/download'>,
) {
    const user = await requireUser()

    const {id} = await params

    const resource = await prisma.resource.findFirst({
        where: {resource_id: id, user_id: user.id},
        select: {file_path: true, file_name: true},
    })

    if (!resource?.file_path) {
        return new Response("ファイルが見つかりません", {status: 404})
    }

    const supabase = await createClient()
    const {data, error} = await supabase.storage
        .from("resources")
        .download(resource.file_path)

    if (error || !data) {
        console.error(error)
        return new Response("ファイルを取得できませんでした", {status: 404})
    }

    const fileName =
        resource.file_name ?? resource.file_path.split("/").pop() ?? "download"

    const asciiName = fileName.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "")
    const encodedName = encodeURIComponent(fileName)

    return new Response(data, {
        headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
            "Cache-Control": "private, no-store",
        },
    })
}
