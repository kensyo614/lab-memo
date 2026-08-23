import {Auth} from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import {logout} from "@/lib/actions"

type Props = {
    current?: "resources" | "memos"
    showTags?: boolean
    selectedTagId?: string
    buildTagHref?: (tagId: string | undefined) => string
}

export async function Sidebar({
    current = "resources",
    showTags = false,
    selectedTagId,
    buildTagHref = (tagId) => (tagId ? `/?tag=${tagId}` : "/"),
}: Props){
    const user = await Auth()
    const tags = showTags
        ? await prisma.tag.findMany({
              where: {user_id: user.id},
              orderBy: {name: "asc"},
              include: {_count: {select: {resourceTags: true}}},
          })
        : []
    return (
        <div style={{
        display: "flex",
        flexDirection: "column",
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
              backgroundColor: current === "resources" ? "#EFEFEF" : undefined,
              fontSize: 13.5,
              fontWeight: current === "resources" ? 500 : 400,
              color: current === "resources" ? "#111111" : "#444444",
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
              backgroundColor: current === "memos" ? "#EFEFEF" : undefined,
              fontSize: 13.5,
              fontWeight: current === "memos" ? 500 : 400,
              color: current === "memos" ? "#111111" : "#444444",
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

        {showTags && (
          <>
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
                  href={buildTagHref(isSelected ? undefined : tag.tag_id)}
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
          </>
        )}
          <div style={{
            marginTop: "auto",
            borderTop: "1px solid #EAEAEA",
            padding: "14px 20px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{
              width: 28,
              height: 28,
              flex: "none",
              borderRadius: "50%",
              backgroundColor: "#EAEAEA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#444444",
            }}>
              {user.email?.charAt(0).toUpperCase()}
            </span>

            <div style={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column"
            }}>
              <p style={{
                fontSize: 12.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {user.email}
              </p>
              <form action={logout}>
                <button type="submit"
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontSize: 11.5,
                  color: "#6E6E6E",
                  textAlign: "left",
                }}>
                  ログアウト
                </button>
              </form>
            </div>
          </div>
      </div>
    )
}