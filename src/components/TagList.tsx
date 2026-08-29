"use client"
import { useActionState, useState } from "react"
import Link from "next/link"

import { createTag, deleteTag, updateTag } from "@/lib/actions"

export type TagItem = {
    tagId: string
    name: string
    count: number
    href: string
    isSelected: boolean
}

type Props = {
    items: TagItem[]
}

const VISIBLE_COUNT = 7

function MenuIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="#444444">
            <circle cx="8" cy="3.2" r="1.35" />
            <circle cx="8" cy="8" r="1.35" />
            <circle cx="8" cy="12.8" r="1.35" />
        </svg>
    )
}

function PencilIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#444444" strokeWidth="1.5">
            <path d="M11.5 2.8l1.7 1.7-7.4 7.4-2.3.6.6-2.3z" />
        </svg>
    )
}

function TrashIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#B14B2C" strokeWidth="1.5">
            <path d="M3 5h10M6 5V3.5h4V5M4.5 5l.6 8h5.8l.6-8" />
        </svg>
    )
}

export function TagList({items}: Props) {
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<TagItem | null>(null)
    const [showAll, setShowAll] = useState(false)

    const [createState, createAction] = useActionState(createTag, null)
    const [updateState, updateAction] = useActionState(updateTag, null)
    const [deleteState, deleteAction] = useActionState(deleteTag, null)

    const error = createState?.error ?? updateState?.error ?? deleteState?.error

    const visibleItems = showAll ? items : items.slice(0, VISIBLE_COUNT)
    const hasMore = items.length > VISIBLE_COUNT

    return (
        <>
            <div style={{
                marginTop: 6,
                padding: "14px 20px 8px",
                borderTop: "1px solid #EAEAEA",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <span style={{fontSize: 11, fontWeight: 500, color: "#6E6E6E"}}>
                    タグ
                </span>
                <button
                    type="button"
                    onClick={() => {
                        setIsAdding((prev) => !prev)
                        setEditingId(null)
                        setOpenMenuId(null)
                    }}
                    aria-label="タグを追加"
                    style={{
                        border: "none",
                        background: "none",
                        padding: 0,
                        fontSize: 12,
                        color: "#1A66C4",
                        cursor: "pointer",
                    }}
                >
                    ＋
                </button>
            </div>

            <div style={{
                padding: "4px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 1,
            }}>
                {isAdding && (
                    <form
                        action={(formData) => {
                            createAction(formData)
                            setIsAdding(false)
                        }}
                    >
                        <input
                            name="name"
                            autoFocus
                            placeholder="新しいタグ名"
                            onKeyDown={(e) => {
                                if (e.key === "Escape") setIsAdding(false)
                            }}
                            style={{
                                width: "100%",
                                height: 32,
                                border: "1.5px solid #1A66C4",
                                borderRadius: 6,
                                backgroundColor: "#FFFFFF",
                                padding: "0 8px",
                                fontSize: 12.5,
                                outline: "none",
                            }}
                        />
                        <div style={{
                            padding: "6px 8px 2px",
                            fontSize: 11,
                            color: "#6E6E6E",
                        }}>
                            Enterで確定・Escで取消
                        </div>
                    </form>
                )}

                {visibleItems.map((item) => {
                    if (editingId === item.tagId) {
                        return (
                            <form
                                key={item.tagId}
                                action={(formData) => {
                                    updateAction(formData)
                                    setEditingId(null)
                                }}
                            >
                                <input type="hidden" name="tag_id" value={item.tagId} />
                                <input
                                    name="name"
                                    autoFocus
                                    defaultValue={item.name}
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") setEditingId(null)
                                    }}
                                    style={{
                                        width: "100%",
                                        height: 32,
                                        border: "1.5px solid #1A66C4",
                                        borderRadius: 6,
                                        backgroundColor: "#FFFFFF",
                                        padding: "0 8px",
                                        fontSize: 12.5,
                                        outline: "none",
                                    }}
                                />
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "6px 8px 2px",
                                }}>
                                    <span style={{fontSize: 11, color: "#6E6E6E"}}>
                                        Enterで確定・Escで取消
                                    </span>
                                    <span style={{
                                        marginLeft: "auto",
                                        fontSize: 11,
                                        color: "#6E6E6E",
                                    }}>
                                        {item.count}件に反映
                                    </span>
                                </div>
                            </form>
                        )
                    }

                    const isHovered = hoveredId === item.tagId
                    const isMenuOpen = openMenuId === item.tagId
                    const showMenuButton = isHovered || isMenuOpen

                    return (
                        <div
                            key={item.tagId}
                            style={{position: "relative"}}
                            onMouseEnter={() => setHoveredId(item.tagId)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <Link
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    height: 30,
                                    padding: showMenuButton ? "0 4px 0 8px" : "0 8px",
                                    borderRadius: 6,
                                    fontSize: 12.5,
                                    backgroundColor: item.isSelected
                                        ? "#1A66C4"
                                        : showMenuButton
                                          ? "#EFEFEF"
                                          : undefined,
                                    color: item.isSelected
                                        ? "#FFFFFF"
                                        : showMenuButton
                                          ? "#111111"
                                          : "#444444",
                                }}
                            >
                                {item.name}

                                {showMenuButton ? (
                                    <span
                                        role="button"
                                        aria-label={`${item.name} のメニュー`}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setOpenMenuId(isMenuOpen ? null : item.tagId)
                                        }}
                                        style={{
                                            marginLeft: "auto",
                                            width: 22,
                                            height: 22,
                                            borderRadius: 4,
                                            backgroundColor: "#E2E2E2",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <MenuIcon />
                                    </span>
                                ) : (
                                    <span style={{
                                        marginLeft: "auto",
                                        fontSize: 11.5,
                                        color: item.isSelected ? undefined : "#6E6E6E",
                                        opacity: item.isSelected ? 0.85 : undefined,
                                    }}>
                                        {item.count}
                                    </span>
                                )}
                            </Link>

                            {isMenuOpen && (
                                <>
                                    <div
                                        onClick={() => setOpenMenuId(null)}
                                        style={{position: "fixed", inset: 0, zIndex: 2}}
                                    />
                                    <div style={{
                                        position: "absolute",
                                        left: "100%",
                                        marginLeft: 8,
                                        top: 0,
                                        width: 188,
                                        backgroundColor: "#FFFFFF",
                                        border: "1px solid #E5E5E5",
                                        borderRadius: 6,
                                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
                                        padding: 5,
                                        zIndex: 3,
                                    }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingId(item.tagId)
                                                setOpenMenuId(null)
                                            }}
                                            style={{
                                                width: "100%",
                                                height: 32,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 9,
                                                padding: "0 10px",
                                                border: "none",
                                                borderRadius: 4,
                                                background: "none",
                                                fontSize: 12.5,
                                                color: "#111111",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <PencilIcon />
                                            名前を変更
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDeleteTarget(item)
                                                setOpenMenuId(null)
                                            }}
                                            style={{
                                                width: "100%",
                                                height: 32,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 9,
                                                padding: "0 10px",
                                                border: "none",
                                                borderRadius: 4,
                                                background: "none",
                                                fontSize: 12.5,
                                                color: "#B14B2C",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <TrashIcon />
                                            タグを削除
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}

                {hasMore && (
                    <button
                        type="button"
                        onClick={() => setShowAll((prev) => !prev)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            height: 30,
                            padding: "0 8px",
                            border: "none",
                            background: "none",
                            fontSize: 12.5,
                            color: "#1A66C4",
                            cursor: "pointer",
                        }}
                    >
                        {showAll ? "表示を減らす" : "すべてのタグを見る"}
                    </button>
                )}

                {error && (
                    <p style={{
                        padding: "6px 8px",
                        fontSize: 11.5,
                        lineHeight: 1.6,
                        color: "#B14B2C",
                    }}>
                        {error}
                    </p>
                )}
            </div>

            {deleteTarget && (
                <div
                    onClick={() => setDeleteTarget(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: 440,
                            backgroundColor: "#FFFFFF",
                            borderRadius: 6,
                            boxShadow: "0 10px 28px rgba(0, 0, 0, 0.2)",
                            padding: "26px 26px 22px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 14,
                            color: "#111111",
                        }}
                    >
                        <h2 style={{fontSize: 17, fontWeight: 600}}>
                            このタグを削除しますか？
                        </h2>
                        <p style={{fontSize: 13, lineHeight: 1.8, color: "#444444"}}>
                            「{deleteTarget.name}」が削除され、
                            {deleteTarget.count} 件の情報からこのタグが外れます。
                            情報そのものは削除されません。
                        </p>

                        <div style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 10,
                            marginTop: 6,
                        }}>
                            <button
                                type="button"
                                autoFocus
                                onClick={() => setDeleteTarget(null)}
                                style={{
                                    height: 38,
                                    padding: "0 18px",
                                    border: "1px solid #111111",
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: 6,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                }}
                            >
                                キャンセル
                            </button>

                            <form
                                action={(formData) => {
                                    deleteAction(formData)
                                    setDeleteTarget(null)
                                }}
                            >
                                <input
                                    type="hidden"
                                    name="tag_id"
                                    value={deleteTarget.tagId}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        height: 38,
                                        padding: "0 18px",
                                        border: "none",
                                        backgroundColor: "#B14B2C",
                                        borderRadius: 6,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: "#FFFFFF",
                                        cursor: "pointer",
                                    }}
                                >
                                    削除する
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
