import Link from "next/link"
import prisma from "@/lib/prisma"
import type {ResourceType} from "@/generated/prisma/enums"
import {Auth} from "@/lib/auth"

const RESOURCE_TYPE_BADGE: Record<
  ResourceType,
  {label: string; color: string; backgroundColor: string}
> = {
  PDF:    {label: "PDF",    color: "#B14B2C", backgroundColor: "#FDF3EF"},
  WEB:    {label: "WEB",    color: "#1A66C4", backgroundColor: "#F2F7FD"},
  GITHUB: {label: "GIT",    color: "#2F6B4F", backgroundColor: "#F0F6F2"},
  VIDEO:  {label: "動画",   color: "#6B4B8A", backgroundColor: "#F6F2F9"},
  OTHER:  {label: "その他", color: "#767676", backgroundColor: "#F2F2F2"},
}

function formatDate(date: Date) {
  return date.toLocaleDateString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  })
}

export default async function Page({searchParams}: PageProps<'/'>) {
  const user = await Auth()

  const {tag} = await searchParams
  const selectedTagId = typeof tag === "string" ? tag : undefined

  const tags = await prisma.tag.findMany({
    where: {user_id: user.id},
    orderBy: {name: "asc"},
    include: {_count: {select: {resourceTags: true}}},
  })

  const resources = await prisma.resource.findMany({
    where: {
      user_id: user.id,
      resourceTags: selectedTagId
        ? {some: {tag_id: selectedTagId}}
        : undefined,
    },
    include: {resourceTags: {
      include: {tag: true}
    }},
    orderBy: {created_at: "desc"}
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
        display: "flex",
        flexDirection: "column",
      }}>
        {resources.map((resource) => { 
          const badge = RESOURCE_TYPE_BADGE[resource.resource_type]
          return (
        <div
          key={resource.resource_id}
          style={{
          display: "grid",
          gridTemplateColumns: "64px 1fr 260px 96px",
          alignItems: "center",
          gap: 18,
          height: 64,
          borderBottom: "1px solid #F0F0F0",
        }}>
          <span style={{
            color: badge.color,
            backgroundColor: badge.backgroundColor,
            fontSize: 11,
            fontWeight: 500,
            padding: "3px 8px",
            borderRadius: 4,
            justifySelf: "start"
          }}>
            {badge.label}
          </span>

          <div style={{minWidth: 0}}>
            <div style={{
              fontSize: 14.5,
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {resource.title}
            </div>
            <div style={{
              fontSize: 12.5,
              color: "#767676",
              marginTop: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {resource.memo}
            </div>
          </div>
          <div style={{
            display: "flex",
            gap: 5,
            overflow: "hidden",
          }}>
            {resource.resourceTags.map((resourceTag) => {
              return (
            <span
              key={resourceTag.tag_id}
              style={{
              fontSize: 11.5,
              color: "#444444",
              backgroundColor: "#F2F2F2",
              padding: "3px 9px",
              borderRadius: 4,
              whiteSpace: "nowrap",
            }}>
              {resourceTag.tag.name}
            </span>
        )})}
          </div>

          <span style={{
            fontSize: 11.5,
            color: "#6E6E6E",
            textAlign: "right",
          }}>
            {formatDate(resource.created_at)}
          </span>
        </div>
        )})}
      </div>
    </div>
  )
}
