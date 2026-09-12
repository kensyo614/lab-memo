import Link from "next/link"
import {notFound} from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import {requireUser} from "@/lib/auth"
import prisma from "@/lib/prisma"
import {Sidebar} from "@/components/Sidebar"
import {DeleteResourceDialog} from "@/components/DeleteResourceDialog"
import {ResourceMemoEditor} from "@/components/ResourceMemoEditor"
import {createClient} from "@/lib/supabase/server"
import {RESOURCE_TYPE_BADGE, formatFullDate, isFileResourceType} from "@/lib/resource"

export default async function Page({params}: PageProps<'/resources/[id]'>){
    const user = await requireUser()

    const {id} = await params

    const resource = await prisma.resource.findFirst({
        where: {resource_id: id, user_id: user.id},
        include: {resourceTags: {include: {tag: true}}},
    })

    if (!resource) {
        notFound()
    }

    const isFile = isFileResourceType(resource.resource_type)

    let signedUrl: string | null = null
    if (isFile && resource.file_path) {
        const supabase = await createClient()
        const {data} = await supabase.storage
            .from("resources")
            .createSignedUrl(resource.file_path, 60 * 60)
        signedUrl = data?.signedUrl ?? null
    }

    const openUrl = isFile
        ? resource.resource_type === "PDF"
            ? signedUrl
            : `/resources/${resource.resource_id}/download`
        : resource.url

    const isMarkdown = resource.resource_type === "MD"
    const MAX_PREVIEW_SIZE = 1024 * 1024
    let markdownBody: string | null = null

    if (isMarkdown && resource.file_path) {
        const supabase = await createClient()
        const {data} = await supabase.storage
            .from("resources")
            .download(resource.file_path)

        if (data && data.size <= MAX_PREVIEW_SIZE) {
            markdownBody = await data.text()
        }
    }

    const badge = RESOURCE_TYPE_BADGE[resource.resource_type]

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
                    <Link href="/" style={{fontSize: 13, color: "#1A66C4"}}>
                        ← 情報一覧
                    </Link>
                    <div style={{
                        marginLeft: "auto",
                        display: "flex",
                        gap: 10,
                    }}>
                        <DeleteResourceDialog
                            resourceId={resource.resource_id}
                            title={resource.title}
                        />

                        <Link
                            href={`/resources/${resource.resource_id}/edit`}
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
                            編集
                        </Link>

                        {openUrl && (
                            <a
                                href={openUrl}
                                target={
                                    isFile && resource.resource_type !== "PDF"
                                        ? undefined
                                        : "_blank"
                                }
                                rel="noopener noreferrer"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    height: 38,
                                    padding: "0 16px",
                                    borderRadius: 6,
                                    backgroundColor: "#1A66C4",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: "#FFFFFF",
                                }}
                            >
                                {isFile
                                    ? resource.resource_type === "PDF"
                                        ? "PDFを開く"
                                        : "ダウンロード"
                                    : "URLを開く"}
                            </a>
                        )}
                    </div>
                </div>

                <div style={{
                    flex: 1,
                    display: "flex",
                    minHeight: 0,
                }}>
                    <div style={{
                        flex: 1,
                        minWidth: 0,
                        backgroundColor: "#FAFAFA",
                        borderRight: "1px solid #EAEAEA",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: 24,
                        gap: 14,
                    }}>
                        {isMarkdown ? (
                            markdownBody !== null ? (
                                <div
                                    className="markdown"
                                    style={{
                                        flex: 1,
                                        width: 520,
                                        maxWidth: "100%",
                                        overflowY: "auto",
                                        border: "1px solid #E5E5E5",
                                        borderRadius: 6,
                                        backgroundColor: "#FFFFFF",
                                        padding: "24px 28px",
                                        fontSize: 14,
                                        lineHeight: 1.95,
                                    }}
                                >
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {markdownBody}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p style={{fontSize: 12.5, color: "#6E6E6E"}}>
                                    中身を表示できませんでした。「ファイルを開く」からダウンロードできます。
                                </p>
                            )
                        ) : isFile ? (
                            signedUrl ? (
                                <iframe
                                    src={signedUrl}
                                    title={resource.title}
                                    style={{
                                        flex: 1,
                                        width: 520,
                                        maxWidth: "100%",
                                        border: "1px solid #E5E5E5",
                                        backgroundColor: "#FFFFFF",
                                    }}
                                />
                            ) : (
                                <p style={{fontSize: 12.5, color: "#6E6E6E"}}>
                                    ファイルを読み込めませんでした。
                                </p>
                            )
                        ) : resource.url ? (
                            <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    width: 520,
                                    maxWidth: "100%",
                                    backgroundColor: "#FFFFFF",
                                    border: "1px solid #E5E5E5",
                                    borderRadius: 6,
                                    padding: "20px 22px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                    color: "#111111",
                                }}
                            >
                                <span style={{fontSize: 11.5, color: "#6E6E6E"}}>
                                    {new URL(resource.url).hostname}
                                </span>
                                <span style={{fontSize: 15, fontWeight: 500, lineHeight: 1.55}}>
                                    {resource.title}
                                </span>
                                <span style={{fontSize: 11.5, color: "#6E6E6E"}}>
                                    登録 {formatFullDate(resource.created_at)}
                                </span>
                                <span style={{fontSize: 12.5, color: "#1A66C4", marginTop: 4}}>
                                    URLを開く →
                                </span>
                            </a>
                        ) : null}
                    </div>

                    <div style={{
                        width: 480,
                        flex: "none",
                        display: "flex",
                        flexDirection: "column",
                        overflowY: "auto",
                    }}>
                        <div style={{
                            padding: "26px 30px 20px",
                            borderBottom: "1px solid #EAEAEA",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}>
                                <span style={{
                                    color: badge.color,
                                    backgroundColor: badge.backgroundColor,
                                    fontSize: 11,
                                    fontWeight: 500,
                                    padding: "3px 8px",
                                    borderRadius: 4,
                                }}>
                                    {badge.label}
                                </span>
                                <span style={{fontSize: 11.5, color: "#6E6E6E"}}>
                                    登録 {formatFullDate(resource.created_at)}
                                    {" ・ "}
                                    更新 {formatFullDate(resource.updated_at)}
                                </span>
                            </div>

                            <h1 style={{
                                fontSize: 20,
                                fontWeight: 600,
                                lineHeight: 1.55,
                            }}>
                                {resource.title}
                            </h1>

                            {resource.resourceTags.length > 0 && (
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 6,
                                }}>
                                    {resource.resourceTags.map((resourceTag) => (
                                        <span
                                            key={resourceTag.tag_id}
                                            style={{
                                                fontSize: 11.5,
                                                color: "#444444",
                                                backgroundColor: "#F2F2F2",
                                                padding: "3px 9px",
                                                borderRadius: 4,
                                            }}
                                        >
                                            {resourceTag.tag.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{
                            flex: 1,
                            padding: "20px 30px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}>
                            <ResourceMemoEditor
                                resourceId={resource.resource_id}
                                memo={resource.memo}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
