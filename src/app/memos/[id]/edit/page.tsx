import { notFound } from "next/navigation"

import { Sidebar } from "@/components/Sidebar"
import { MemoForm } from "@/components/MemoForm"
import { DeleteMemoDialog } from "@/components/DeleteMemoDialog"
import { updateMemo } from "@/lib/actions"
import { requireUser } from "@/lib/auth"
import prisma from "@/lib/prisma"

export default async function Page({params}: PageProps<'/memos/[id]/edit'>){
    const user = await requireUser()

    const {id} = await params

    const memo = await prisma.memo.findFirst({
        where: {memo_id: id, user_id: user.id},
    })

    if (!memo) {
        notFound()
    }

    return (
        <div style={{
            display: "flex",
            height: "100vh"
        }}>
            <Sidebar current="memos" />
            <MemoForm
                action={updateMemo}
                heading="メモを編集"
                deleteButton={
                    <DeleteMemoDialog memoId={memo.memo_id} title={memo.title} />
                }
                defaultValues={{
                    memoId: memo.memo_id,
                    title: memo.title,
                    body: memo.body ?? "",
                }}
            />
        </div>
    )
}
