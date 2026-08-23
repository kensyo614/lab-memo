"use client"
import { useEffect } from "react"
import Link from "next/link"

export default function Error({
    error,
    retry,
}: {
    error: Error & {digest?: string}
    retry: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#FFFFFF",
            color: "#111111",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            padding: "0 28px",
            textAlign: "center",
        }}>
            <h1 style={{fontSize: 18, fontWeight: 600}}>
                読み込みに失敗しました
            </h1>
            <p style={{fontSize: 13, lineHeight: 1.8, color: "#444444"}}>
                通信が不安定か、一時的な問題が起きた可能性があります。
                <br />
                しばらく待ってから、もう一度お試しください。
            </p>

            <div style={{
                display: "flex",
                gap: 10,
                marginTop: 6,
            }}>
                <Link
                    href="/"
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
                    情報一覧へ戻る
                </Link>
                <button
                    type="button"
                    onClick={() => retry()}
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
                    再試行
                </button>
            </div>
        </div>
    )
}
