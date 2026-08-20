
import {Auth} from "@/lib/auth"
import Link from "next/link"
import {Sidebar} from "@/components/Sidebar"
import prisma from "@/lib/prisma"
import { ResourceForm } from "@/components/ResourceForm"
import { createResource } from "@/lib/actions"

export default async function Page(){
    const user = await Auth()

    const tags = await prisma.tag.findMany({
        where: {user_id: user.id},
        orderBy: {name: "asc"},
    })
    return (
        <div style={{
            display: "flex",
            height: "100vh",
        }}
        >
            <Sidebar />
            <div style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#FFFFFF",
                color: "#111111",
            }}
            >
                <div style={{
                    display: "flex",
                    borderBottom: "1px solid #EAEAEA",
                    alignItems: "center",
                    gap: 12,
                    flex: "none",
                    height: 60,
                    padding: "0 28px",
                }}
                >
                    <Link href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: 13,
                        color: "#1A66C4",
                    }}>
                        ← 情報一覧
                    </Link>
                    <span style={{color: "#DDDDDD"}}>/</span>
                    <h1 style={{
                        fontSize: 18,
                        fontWeight: 600,
                    }}>
                        情報を登録
                    </h1>
                    <div style={{
                        marginLeft: "auto",
                        display: "flex",
                        flexDirection: "row",
                        gap: 10
                    }}>
                        <Link href="/"
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
                        }}>
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
                        }}>
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
                    <ResourceForm tags={tags} userId={user.id} action={createResource} />
                </div>
            </div>
        </div>
    )
}
