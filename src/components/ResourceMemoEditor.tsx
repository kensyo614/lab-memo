"use client"
import { useActionState, useState } from "react"

import { updateResourceMemo } from "@/lib/actions"

type Props = {
    resourceId: string
    note: string | null
}

export function ResourceMemoEditor({resourceId, note}: Props) {
    const [isEditing, setIsEditing] = useState(false)
    const [state, formAction, isPending] = useActionState(updateResourceMemo, null)

    if (!isEditing) {
        return (
            <>
                <div style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                }}>
                    <span style={{fontSize: 11.5, color: "#6E6E6E"}}>メモ</span>
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        style={{
                            border: "none",
                            background: "none",
                            padding: 0,
                            fontSize: 12,
                            color: "#1A66C4",
                            cursor: "pointer",
                        }}
                    >
                        {note ? "編集" : "メモを書く"}
                    </button>
                </div>

                {state?.error && (
                    <p style={{fontSize: 12, color: "#B14B2C"}}>{state.error}</p>
                )}

                {note ? (
                    <p style={{
                        fontSize: 14,
                        lineHeight: 1.9,
                        whiteSpace: "pre-wrap",
                    }}>
                        {note}
                    </p>
                ) : (
                    <p style={{fontSize: 13, color: "#767676"}}>
                        メモはまだありません。
                    </p>
                )}
            </>
        )
    }

    return (
        <form
            action={(formData) => {
                formAction(formData)
                setIsEditing(false)
            }}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
            }}
        >
            <input type="hidden" name="resource_id" value={resourceId} />

            <div style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
            }}>
                <span style={{fontSize: 11.5, color: "#6E6E6E"}}>メモ</span>
                <span style={{fontSize: 11, color: "#6E6E6E"}}>
                    Escで取消
                </span>
            </div>

            <textarea
                name="note"
                autoFocus
                defaultValue={note ?? ""}
                onKeyDown={(e) => {
                    if (e.key === "Escape") setIsEditing(false)
                }}
                style={{
                    height: 220,
                    border: "1.5px solid #1A66C4",
                    borderRadius: 6,
                    padding: "12px 14px",
                    fontSize: 14,
                    lineHeight: 1.9,
                    outline: "none",
                    resize: "vertical",
                }}
            />

            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
            }}>
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{
                        height: 32,
                        padding: "0 14px",
                        border: "1px solid #DDDDDD",
                        backgroundColor: "#FFFFFF",
                        borderRadius: 6,
                        fontSize: 12.5,
                        cursor: "pointer",
                    }}
                >
                    キャンセル
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    style={{
                        height: 32,
                        padding: "0 16px",
                        border: "none",
                        borderRadius: 6,
                        backgroundColor: "#1A66C4",
                        fontSize: 12.5,
                        fontWeight: 500,
                        color: "#FFFFFF",
                        cursor: isPending ? "not-allowed" : "pointer",
                        opacity: isPending ? 0.6 : 1,
                    }}
                >
                    {isPending ? "保存中..." : "保存"}
                </button>
            </div>
        </form>
    )
}
