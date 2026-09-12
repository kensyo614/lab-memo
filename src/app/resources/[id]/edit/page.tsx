import Link from "next/link"

import { ResourceForm } from "@/components/ResourceForm"
import { updateResource } from "@/lib/actions"
import { Sidebar } from "@/components/Sidebar"
import {requireUser} from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function Page({params}: PageProps<'/resources/[id]/edit'>){
    const {id} = await params
    const user = await requireUser()
    const resource = await prisma.resource.findFirst({
        where: {resource_id: id, user_id: user.id},
        include: {resourceTags: {include: {tag: true}}}
    })
    if(!resource){
        notFound()
    }

    const tags = await prisma.tag.findMany({
        where: {user_id: user.id},
        orderBy: {name: "asc"}
    })

    return (
        <div style={{
            display: "flex",
            height: "100vh",
        }}>
            <Sidebar />

            <div style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#FFFFFF",
                color: "#111111",
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flex: "none",
                    height: 60,
                    padding: "0 28px",
                    borderBottom: "1px solid #EAEAEA",
                }}>
                    <Link
                        href={`/resources/${resource.resource_id}`}
                        style={{fontSize: 13, color: "#1A66C4"}}
                    >
                        ← 情報詳細
                    </Link>
                    <span style={{color: "#DDDDDD"}}>/</span>
                    <h1 style={{fontSize: 18, fontWeight: 600}}>情報を編集</h1>

                    <div style={{
                        marginLeft: "auto",
                        display: "flex",
                        gap: 10,
                    }}>
                        <Link
                            href={`/resources/${resource.resource_id}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                height: 38,
                                padding: "0 16px",
                                border: "1px solid #DDDDDD",
                                backgroundColor: "#FFFFFF",
                                borderRadius: 6,
                                fontSize: 13,
                                color: "#111111",
                            }}
                        >
                            キャンセル
                        </Link>
                        <button
                            type="submit"
                            form="resource-form"
                            style={{
                                height: 38,
                                padding: "0 20px",
                                border: "none",
                                borderRadius: 6,
                                backgroundColor: "#1A66C4",
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#FFFFFF",
                                cursor: "pointer",
                            }}
                        >
                            保存
                        </button>
                    </div>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "32px 28px",
                    display: "flex",
                    justifyContent: "center",
                }}>
                    <ResourceForm
                        tags={tags}
                        userId={user.id}
                        action={updateResource}
                        defaultValues={{
                            resourceId: resource.resource_id,
                            resourceType: resource.resource_type,
                            title: resource.title,
                            url: resource.url ?? "",
                            memo: resource.memo ?? "",
                            filePath: resource.file_path,
                            tagIds: resource.resourceTags.map((rt) => rt.tag_id),
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
