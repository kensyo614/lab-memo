"use client"
import { useActionState, useState } from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { FormState } from "@/lib/actions"

const VIEW_MODES = [
    {value: "edit", label: "編集"},
    {value: "preview", label: "プレビュー"},
    {value: "split", label: "2分割"},
] as const

type ViewMode = (typeof VIEW_MODES)[number]["value"]

type DefaultValues = {
    memoId: string,
    title: string,
    memo: string,
}

type Props = {
    action: (prevState: FormState, formData: FormData) => Promise<FormState>,
    defaultValues?: DefaultValues,
    heading: string,
    deleteButton?: React.ReactNode,
}

export function MemoForm({action, defaultValues, heading, deleteButton}: Props){
    const [state, formAction, isPending] = useActionState(action, null)

    const [title, setTitle] = useState(defaultValues?.title ?? "")
    const [markdown, setMarkdown] = useState(defaultValues?.memo ?? "")

    const [viewMode, setViewMode] = useState<ViewMode>("split")

    return (
        <form
            id="memo-form"
            action={formAction}
            style={{
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
                alignItems: "center",
                gap: 14,
                flex: "none",
                height: 60,
                padding: "0 28px",
                borderBottom: "1px solid #EAEAEA",
            }}>
                <Link href="/memos" style={{fontSize: 13, color: "#1A66C4"}}>
                    ← 自由メモ
                </Link>
                <span style={{color: "#DDDDDD"}}>/</span>
                <h1 style={{fontSize: 18, fontWeight: 600}}>{heading}</h1>

                <div style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                }}>
                    <div style={{
                        display: "flex",
                        border: "1px solid #DDDDDD",
                        borderRadius: 6,
                        overflow: "hidden",
                        height: 34,
                    }}>
                        {VIEW_MODES.map((mode, index) => {
                            const isSelected = viewMode === mode.value

                            return (
                                <button
                                    key={mode.value}
                                    type="button"
                                    onClick={() => setViewMode(mode.value)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "0 16px",
                                        border: "none",
                                        borderLeft:
                                            index === 0 ? undefined : "1px solid #DDDDDD",
                                        backgroundColor: isSelected ? "#111111" : "#FFFFFF",
                                        color: isSelected ? "#FFFFFF" : "#444444",
                                        fontSize: 12.5,
                                        cursor: "pointer",
                                    }}
                                >
                                    {mode.label}
                                </button>
                            )
                        })}
                    </div>

                    {deleteButton}

                    <Link
                        href="/memos"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            height: 38,
                            padding: "0 14px",
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
                        disabled={isPending}
                        style={{
                            height: 38,
                            padding: "0 20px",
                            border: "none",
                            borderRadius: 6,
                            backgroundColor: "#1A66C4",
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#FFFFFF",
                            cursor: isPending ? "not-allowed" : "pointer",
                            opacity: isPending ? 0.6 : 1,
                        }}
                    >
                        {isPending ? "保存中..." : "保存"}
                    </button>
                </div>
            </div>

            {state?.error && (
                <div style={{
                    flex: "none",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 9,
                    backgroundColor: "#FDF3EF",
                    borderBottom: "1px solid #F0D9D0",
                    padding: "10px 28px",
                }}>
                    <span style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: "#B14B2C",
                        color: "#FFFFFF",
                        fontSize: 11,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: "none",
                        marginTop: 1,
                    }}>
                        !
                    </span>
                    <span style={{fontSize: 12.5, lineHeight: 1.7, color: "#8F3D24"}}>
                        {state.error}
                    </span>
                </div>
            )}

            {defaultValues && (
                <input type="hidden" name="memo_id" value={defaultValues.memoId} />
            )}

            <div style={{
                flex: 1,
                display: "flex",
                minHeight: 0,
            }}>
                <div style={{
                    display: viewMode === "preview" ? "none" : "flex",
                    flex: 1,
                    minWidth: 0,
                    flexDirection: "column",
                    borderRight: "1px solid #EAEAEA",
                }}>
                    <div style={{
                        height: 40,
                        flex: "none",
                        borderBottom: "1px solid #F0F0F0",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 28px",
                        backgroundColor: "#FAFAFA",
                        fontSize: 12,
                        color: "#444444",
                    }}>
                        {/* TODO: H1 B I などの記法を挿入するボタン */}
                        <span style={{
                            marginLeft: "auto",
                            fontSize: 11.5,
                            color: "#6E6E6E",
                        }}>
                            {markdown.length.toLocaleString()} 字
                        </span>
                    </div>

                    <div style={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        padding: "28px 28px 0",
                        display: "flex",
                        justifyContent: "center",
                    }}>
                        <div style={{
                            width: "100%",
                            maxWidth: 640,
                            display: "flex",
                            flexDirection: "column",
                            gap: 18,
                        }}>
                            <input
                                name="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="タイトル"
                                style={{
                                    border: "none",
                                    outline: "none",
                                    borderBottom: "1px solid #F0F0F0",
                                    paddingBottom: 14,
                                    fontSize: 23,
                                    fontWeight: 600,
                                }}
                            />
                            <textarea
                                name="memo"
                                value={markdown}
                                onChange={(e) => setMarkdown(e.target.value)}
                                placeholder="Markdownで自由に書けます"
                                style={{
                                    flex: 1,
                                    minHeight: 320,
                                    border: "none",
                                    outline: "none",
                                    padding: 0,
                                    fontFamily:
                                        "ui-monospace, SFMono-Regular, Menlo, monospace",
                                    fontSize: 13,
                                    lineHeight: 2,
                                    resize: "none",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{
                    display: viewMode === "edit" ? "none" : "flex",
                    flex: 1,
                    minWidth: 0,
                    flexDirection: "column",
                    backgroundColor: "#FAFAFA",
                }}>
                    <div style={{
                        height: 40,
                        flex: "none",
                        borderBottom: "1px solid #F0F0F0",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 28px",
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: ".1em",
                        color: "#6E6E6E",
                    }}>
                        プレビュー
                    </div>

                    <div style={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        padding: "28px 28px 0",
                        display: "flex",
                        justifyContent: "center",
                    }}>
                        <div style={{
                            width: "100%",
                            maxWidth: 640,
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}>
                            <div style={{
                                fontSize: 23,
                                fontWeight: 600,
                                borderBottom: "1px solid #EAEAEA",
                                paddingBottom: 14,
                                color: title === "" ? "#767676" : undefined,
                            }}>
                                {title === "" ? "タイトル" : title}
                            </div>

                            <div className="markdown" style={{fontSize: 14, lineHeight: 1.95}}>
                                {markdown.trim() === "" ? (
                                    <p style={{fontSize: 13, color: "#767676"}}>
                                        本文を入力するとここに表示されます。
                                    </p>
                                ) : (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {markdown}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
