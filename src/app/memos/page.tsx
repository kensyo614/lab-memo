import prisma from "@/lib/prisma"
import {Auth} from "@/lib/auth"
import { Sidebar } from "@/components/Sidebar"
import Link from "next/link"
import { formatFullDate } from "@/lib/resource"
import { Sort } from "@/components/SortSelect"

const MEMO_SORT_ORDER = {
    new:   {created_at: "desc"},
    old:   {created_at: "asc"},
    title: {title: "asc"},
} as const

type MemoSort = keyof typeof MEMO_SORT_ORDER

const MEMO_SORT_OPTIONS = [
    {value: "new", label: "作成日の新しい順"},
    {value: "old", label: "作成日の古い順"},
    {value: "title", label: "タイトル順"},
]

export default async function Page({searchParams}: PageProps<'/memos'>){
    const user = await Auth()
    const {q} = await searchParams
    const keyword =
        typeof q === "string" && q.trim() !== "" ? q.trim() : undefined

    const {sort} = await searchParams
    const selectedSort: MemoSort =
        typeof sort === "string" && sort in MEMO_SORT_ORDER
            ? (sort as MemoSort)
            : "new"

    const memos = await prisma.memo.findMany({
        where: {
            user_id: user.id,
            OR: keyword
                ? [
                      {title: {contains: keyword, mode: "insensitive"}},
                      {memo: {contains: keyword, mode: "insensitive"}},
                  ]
                : undefined,
        },
        orderBy: MEMO_SORT_ORDER[selectedSort],
    })

    return (
        <div style={{
            display: "flex",
            height: "100vh"
        }}>
            <Sidebar current="memos" />
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
                    gap: 16,
                    padding: "0 28px",
                    flex: "none",
                    height: 60,
                    borderBottom: "1px solid #EAEAEA",
                    }}>
                        <h1 style={{
                            fontSize: 18,
                            fontWeight: 600
                        }}>
                            自由メモ
                        </h1>

                        <form
                            action="/memos"
                            style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            width: 380,
                            height: 38,
                            border: "1px solid #DDDDDD",
                            borderRadius: 6,
                            padding: "0 12px",
                            marginLeft: 8,
                            }}
                        >
                            {selectedSort !== "new" && (
                                <input type="hidden" name="sort" value={selectedSort} />
                            )}
                            <input
                                name="q"
                                defaultValue={keyword ?? ""}
                                placeholder="タイトル・本文を検索"
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    border: "none",
                                    outline: "none",
                                    backgroundColor: "transparent",
                                    fontSize: 13,
                                }}
                            />
                        </form>
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 10,
                            marginLeft: "auto"
                        }}>
                            <Link href="/" style={{
                                display: "flex",
                                alignItems: "center",
                                height: 38,
                                padding: "0 14px",
                                border: "1px solid #DDDDDD",
                                backgroundColor: "#FFFFFF",
                                borderRadius: 6,
                                fontSize: 13,
                                color: "#111111",
                            }}>
                            情報一覧
                            </Link>
                            <Link href="/memos/new" style={{
                                display: "flex",
                                alignItems: "center",
                                height: 38,
                                padding: "0 16px",
                                borderRadius: 6,
                                backgroundColor: "#1A66C4",
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#FFFFFF",
                            }}>
                            ＋ メモを作成
                            </Link>
                        </div>
                </div>

                <div style={{
                    flex: "none",
                    padding: "14px 28px",
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #F0F0F0",
                }}>
                    <span style={{fontSize: 11.5, color: "#6E6E6E"}}>
                        {memos.length} 件
                    </span>
                    <div style={{marginLeft: "auto"}}>
                        <Sort
                            value={selectedSort}
                            basePath="/memos"
                            options={MEMO_SORT_OPTIONS}
                        />
                    </div>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "24px 28px",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gridAutoRows: "188px",
                    gap: 20,
                    alignContent: "start",
                }}>
                    {memos.map((memo) => {
                    return (
                    <Link
                        key={memo.memo_id}
                        href={`/memos/${memo.memo_id}/edit`}
                        style={{
                        border: "1px solid #E5E5E5",
                        borderRadius: 6,
                        padding: 20,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        color: "#111111",
                    }}>
                        <div style={{fontSize: 14.5, fontWeight: 500}}>
                           {memo.title}
                        </div>
                        <p style={{
                            flex: 1,
                            fontSize: 13,
                            lineHeight: 1.85,
                            color: "#767676",
                            overflow: "hidden",
                        }}>
                            {memo.memo}
                        </p>
                        <div style={{fontSize: 11.5, color: "#6E6E6E"}}>
                            {formatFullDate(memo.created_at)}
                        </div>
                    </Link>
                    )})}

                    <Link
                        href="/memos/new"
                        style={{
                            border: "1px dashed #DDDDDD",
                            borderRadius: 6,
                            backgroundColor: "#FAFAFA",
                            padding: 20,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            color: "#6E6E6E",
                        }}
                    >
                        <span style={{fontSize: 20, fontWeight: 300}}>＋</span>
                        <span style={{fontSize: 12.5}}>新しいメモ</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}