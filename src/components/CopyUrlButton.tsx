"use client"
import { useState } from "react"

type Props = {
    url: string
    size?: "compact" | "header"
}

const SIZES = {
    compact: {height: 26, padding: "0 10px", fontSize: 11.5},
    header:  {height: 38, padding: "0 16px", fontSize: 13},
} as const

export function CopyUrlButton({url, size = "compact"}: Props){
    const [isCopied, setIsCopied] = useState(false)

    async function handleCopy(){
        try {
            await navigator.clipboard.writeText(url)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch {
            setIsCopied(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            style={{
                flex: "none",
                display: "flex",
                alignItems: "center",
                border: "1px solid #DDDDDD",
                borderRadius: 6,
                backgroundColor: "#FFFFFF",
                color: isCopied ? "#2F6B4F" : "#444444",
                cursor: "pointer",
                whiteSpace: "nowrap",
                ...SIZES[size],
            }}
        >
            {isCopied ? "コピーしました" : "URLをコピー"}
        </button>
    )
}
