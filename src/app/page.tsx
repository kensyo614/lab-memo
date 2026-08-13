import Link from "next/link"
import prisma from "@/lib/prisma"
import {Auth} from "@/lib/auth"
export default async function Page({searchParams}: PageProps<'/'>) {
  const user = await Auth()

  const {tag} = await searchParams
  const selectedTagId = typeof tag === "string" ? tag : undefined

  const tags = await prisma.tag.findMany({
    where: {user_id: user.id},
    orderBy: {name: "asc"},
    include: {_count: {select: {resourceTags: true}}},
  })
  return (
    <div style={{
      display: "flex",
      height: "100vh"
    }}
    >
      <div style={{
        width: 240,
        flex: "none",
        backgroundColor: "#FAFAFA",
      }}
      >
        <p style={{
          padding: "20px 20px 18px",
          fontSize: 18,
          fontWeight: 600,
          borderBottom: "1px solid #EAEAEA",
        }}>
          LabMemo
        </p>
        <div style={{
          padding: "14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              height: 36,
              padding: "0 12px",
              borderRadius: 6,
              backgroundColor: "#EFEFEF",
              fontSize: 13.5,
              fontWeight: 500,
              color: "#111111",
            }}
          >
            情報一覧
            <span style={{
              marginLeft: "auto",
              fontSize: 11.5,
              fontWeight: 400,
              color: "#6E6E6E",
            }}>
              {prisma.resource.count({where: {user_id: user.id}})}
            </span>
          </Link>

          <Link
            href="/memos"
            style={{
              display: "flex",
              alignItems: "center",
              height: 36,
              padding: "0 12px",
              borderRadius: 6,
              fontSize: 13.5,
              color: "#444444",
            }}
          >
            自由メモ
            <span style={{
              marginLeft: "auto",
              fontSize: 11.5,
              color: "#6E6E6E",
            }}>
              {prisma.memo.count({where: {user_id: user.id}})}
            </span>
          </Link>
        </div>

        <div style={{
          marginTop: 6,
          padding: "14px 24px 8px",
          borderTop: "1px solid #EAEAEA",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#6E6E6E",
          }}>
            タグ
          </span>
          <span style={{
            fontSize: 12,
            color: "#1A66C4",
          }}>
            編集
          </span>
        </div>
        <div style={{
          padding: "4px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
        >
          {tags.map((tag) => {
            const isSelected = tag.tag_id === selectedTagId

            return (
              <Link
                key={tag.tag_id}
                href={isSelected ? "/" : `/?tag=${tag.tag_id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 30,
                  padding: "0 8px",
                  borderRadius: 6,
                  fontSize: 12.5,
                  backgroundColor: isSelected ? "#1A66C4" : undefined,
                  color: isSelected ? "#FFFFFF" : "#444444",
                }}
              >
                {tag.name}
                <span style={{
                  marginLeft: "auto",
                  fontSize: 11.5,
                  color: isSelected ? undefined : "#6E6E6E",
                  opacity: isSelected ? 0.85 : undefined,
                }}>
                  {tag._count.resourceTags}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      <div style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: "black",
        display: "flex",
        flexDirection: "column",
      }}>
      </div>
    </div>
  )
}
