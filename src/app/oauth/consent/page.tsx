import {notFound, redirect} from "next/navigation"

import {requireUser} from "@/lib/auth"
import {createClient} from "@/lib/supabase/server"
import {
    approveOauthAuthorization,
    denyOauthAuthorization,
} from "@/lib/actions"

export default async function Page({searchParams}: PageProps<'/oauth/consent'>){
    const user = await requireUser()

    const {authorization_id} = await searchParams

    const authorizationId =
        typeof authorization_id === "string" ? authorization_id : undefined

    if (!authorizationId) {
        notFound()
    }

    const supabase = await createClient()
    const {data, error} = await supabase.auth.oauth.getAuthorizationDetails(
        authorizationId,
    )

    if (error || !data) {
        console.error(error)
        notFound()
    }

    if (!("authorization_id" in data)) {
        redirect(data.redirect_url)
    }

    const clientName = data.client.name
    const clientInitial = clientName.slice(0, 1).toUpperCase()

    const ALLOWED = [
        {title: "登録した資料の閲覧", detail: "論文・URL・リポジトリのタイトルと本文"},
        {title: "タグの閲覧", detail: "タグ名と、各タグが付いた資料の対応"},
        {title: "メモの閲覧", detail: "資料に書いたメモと自由メモの本文"},
    ]

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#FAFAFA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
        }}>
            <div style={{
                width: 440,
                maxWidth: "100%",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E5E5",
                borderRadius: 8,
                padding: 40,
                display: "flex",
                flexDirection: "column",
                gap: 28,
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 22,
                }}>
                    <div style={{fontSize: 15, fontWeight: 600, letterSpacing: ".01em"}}>
                        LabMemo
                    </div>

                    <div style={{display: "flex", alignItems: "center", gap: 14}}>
                        <span style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            backgroundColor: "#D97757",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#FFFFFF",
                        }}>
                            {clientInitial}
                        </span>

                        <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="#C4C4C4" strokeWidth="1.4">
                            <line x1="1" y1="7" x2="21" y2="7" strokeDasharray="3 3" />
                            <polyline points="18,3.5 22,7 18,10.5" />
                        </svg>

                        <span style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            backgroundColor: "#1A66C4",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#FFFFFF",
                        }}>
                            L
                        </span>
                    </div>

                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 9,
                        textAlign: "center",
                    }}>
                        <h1 style={{fontSize: 21, fontWeight: 600, lineHeight: 1.5}}>
                            アクセスを許可しますか？
                        </h1>
                        <p style={{fontSize: 13.5, lineHeight: 1.8, color: "#444444"}}>
                            <strong style={{fontWeight: 600}}>{clientName}</strong>
                            {" "}があなたのLabMemoのデータを<br />読み取ろうとしています。
                        </p>
                    </div>
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    border: "1px solid #EAEAEA",
                    borderRadius: 6,
                    padding: "11px 14px",
                    backgroundColor: "#FAFAFA",
                }}>
                    <span style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        backgroundColor: "#EAEAEA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12.5,
                        color: "#444444",
                        flex: "none",
                    }}>
                        {(user.email ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                    <div style={{flex: 1, minWidth: 0}}>
                        <div style={{fontSize: 11, color: "#6E6E6E"}}>
                            ログイン中のアカウント
                        </div>
                        <div style={{
                            fontSize: 13,
                            marginTop: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}>
                            {user.email}
                        </div>
                    </div>
                </div>

                <div style={{display: "flex", flexDirection: "column", gap: 14}}>
                    <div style={{fontSize: 12, fontWeight: 500, color: "#6E6E6E"}}>
                        {clientName} に許可する内容
                    </div>

                    <div style={{display: "flex", flexDirection: "column", gap: 13}}>
                        {ALLOWED.map((item) => (
                            <div
                                key={item.title}
                                style={{display: "flex", alignItems: "flex-start", gap: 11}}
                            >
                                <svg
                                    width="16" height="16" viewBox="0 0 16 16"
                                    fill="none" stroke="#1A66C4" strokeWidth="1.8"
                                    style={{flex: "none", marginTop: 3}}
                                >
                                    <polyline points="3,8.5 6.5,12 13,4.5" />
                                </svg>
                                <div>
                                    <div style={{fontSize: 13.5, fontWeight: 500}}>
                                        {item.title}
                                    </div>
                                    <div style={{
                                        fontSize: 12.5,
                                        color: "#6E6E6E",
                                        lineHeight: 1.7,
                                        marginTop: 3,
                                    }}>
                                        {item.detail}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 11,
                        paddingTop: 2,
                    }}>
                        <svg
                            width="16" height="16" viewBox="0 0 16 16"
                            fill="none" stroke="#767676" strokeWidth="1.6"
                            style={{flex: "none", marginTop: 3}}
                        >
                            <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" />
                            <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" />
                        </svg>
                        <div style={{fontSize: 13, color: "#444444", lineHeight: 1.7}}>
                            データの作成・変更・削除は
                            <strong style={{fontWeight: 600}}>できません</strong>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 9,
                    borderTop: "1px solid #F0F0F0",
                    paddingTop: 18,
                }}>
                    <svg
                        width="14" height="14" viewBox="0 0 16 16"
                        fill="none" stroke="#767676" strokeWidth="1.5"
                        style={{flex: "none", marginTop: 3}}
                    >
                        <rect x="3" y="7" width="10" height="6.5" rx="1.5" />
                        <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
                    </svg>
                    <div style={{flex: 1, minWidth: 0}}>
                        <div style={{fontSize: 11, color: "#6E6E6E"}}>
                            許可すると、次のURLに戻ります
                        </div>
                        <div style={{
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                            fontSize: 11.5,
                            color: "#444444",
                            marginTop: 3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}>
                            {data.redirect_uri}
                        </div>
                    </div>
                </div>

                <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                    <form action={approveOauthAuthorization}>
                        <input
                            type="hidden"
                            name="authorization_id"
                            value={data.authorization_id}
                        />
                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                height: 46,
                                border: "none",
                                borderRadius: 6,
                                backgroundColor: "#1A66C4",
                                color: "#FFFFFF",
                                fontSize: 14.5,
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            許可する
                        </button>
                    </form>

                    <form action={denyOauthAuthorization}>
                        <input
                            type="hidden"
                            name="authorization_id"
                            value={data.authorization_id}
                        />
                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                height: 46,
                                border: "1px solid #DDDDDD",
                                borderRadius: 6,
                                backgroundColor: "#FFFFFF",
                                color: "#111111",
                                fontSize: 14.5,
                                cursor: "pointer",
                            }}
                        >
                            拒否
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
