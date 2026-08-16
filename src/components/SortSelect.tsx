"use client"
import { useRouter, useSearchParams } from "next/navigation"

type Props = {
    value: string
}

export function Sort({value}: Props){
    const router = useRouter()
    const searchParams = useSearchParams()

    function sort(e: React.ChangeEvent<HTMLSelectElement>){
        const params = new URLSearchParams(searchParams.toString())

        if (e.target.value === "new") {
            params.delete("sort")
        } else {
            params.set("sort", e.target.value)
        }

        const query = params.toString()
        router.push(query ? `/?${query}` : "/")
    }

    return (
        <select
            value={value}
            onChange={sort}
            style={{
                height: 30,
                padding: "0 11px",
                border: "1px solid #DDDDDD",
                borderRadius: 6,
                fontSize: 12.5,
                backgroundColor: "#FFFFFF",
                color: "#111111",
                cursor: "pointer",
            }}
        >
              <option value="new">登録日の新しい順</option>
              <option value="old">登録日の古い順</option>
              <option value="title">タイトル順</option>
        </select>
    )
}
