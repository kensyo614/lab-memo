import { Sidebar } from "@/components/Sidebar"
import { MemoForm } from "@/components/MemoForm"
import { createMemo } from "@/lib/actions"
import {requireUser} from "@/lib/auth"

export default async function Page(){
    await requireUser()

    return (
        <div style={{
            display: "flex",
            height: "100vh"
        }}>
            <Sidebar current="memos" />
            <MemoForm action={createMemo} heading="メモを作成" />
        </div>
    )
}
