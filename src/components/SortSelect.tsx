"use client"
import { useRouter, useSearchParams } from "next/navigation"

type Props = {
    value: string
    basePath: string
    options: {value: string; label: string}[]
}

export function Sort({value, basePath, options}: Props){
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
        router.push(query ? `${basePath}?${query}` : basePath)
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
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    )
}
