import Link from "next/link"
import prisma from "@/lib/prisma"
import type {ResourceType} from "@/generated/prisma/enums"
import {RESOURCE_TYPE_BADGE, RESOURCE_TYPE_FILTERS, formatDate} from "@/lib/resource"
import {Auth} from "@/lib/auth"
import {Sort} from "@/components/SortSelect"
import {Sidebar} from "@/components/Sidebar"

const RESOURCE_SORT_ORDER = {
  new:   {created_at: "desc"},
  old:   {created_at: "asc"},
  title: {title: "asc"},
} as const

type ResourceSort = keyof typeof RESOURCE_SORT_ORDER

export default async function Page({searchParams}: PageProps<'/'>) {
  const user = await Auth()

  const {tag} = await searchParams
  const selectedTagId = typeof tag === "string" ? tag : undefined
  const {q} = await searchParams
  const keyword =
    typeof q === "string" && q.trim() !== "" ? q.trim() : undefined

  const {type} = await searchParams
  const selectedType =
    typeof type === "string" && type in RESOURCE_TYPE_BADGE
      ? (type as ResourceType)
      : undefined
  const {sort} = await searchParams
  const selectedSort: ResourceSort =
    typeof sort === "string" && sort in RESOURCE_SORT_ORDER
      ? (sort as ResourceSort)
      : "new"

  function buildHref(
    overrides: Partial<Record<"tag" | "q" | "type" | "sort", string | undefined>>,
  ) {
    const next = {
      tag: selectedTagId,
      q: keyword,
      type: selectedType as string | undefined,
      sort: selectedSort === "new" ? undefined : (selectedSort as string),
      ...overrides,
    }

    const params = new URLSearchParams()
    if (next.tag) params.set("tag", next.tag)
    if (next.q) params.set("q", next.q)
    if (next.type) params.set("type", next.type)
    if (next.sort) params.set("sort", next.sort)

    const query = params.toString()
    return query ? `/?${query}` : "/"
  }

  const baseWhere = {
    user_id: user.id,
    resourceTags: selectedTagId
      ? {some: {tag_id: selectedTagId}}
      : undefined,
    OR: keyword
      ? [
          {title: {contains: keyword, mode: "insensitive" as const}},
          {memo: {contains: keyword, mode: "insensitive" as const}},
          {
            resourceTags: {
              some: {
                tag: {name: {contains: keyword, mode: "insensitive" as const}},
              },
            },
          },
        ]
      : undefined,
  }

  const resources = await prisma.resource.findMany({
    where: {...baseWhere, resource_type: selectedType},
    include: {resourceTags: {
      include: {tag: true}
    }},
    orderBy: RESOURCE_SORT_ORDER[selectedSort]
  })


  const typeCounts = await prisma.resource.groupBy({
    by: ["resource_type"],
    where: baseWhere,
    _count: true,
  })

  const countByType = new Map(
    typeCounts.map((row) => [row.resource_type, row._count]),
  )
  const totalCount = typeCounts.reduce((sum, row) => sum + row._count, 0)


  return (
    <div style={{
      display: "flex",
      height: "100vh"
    }}
    >
      <Sidebar
        showTags
        selectedTagId={selectedTagId}
        buildTagHref={(tagId) => buildHref({tag: tagId})}
      />
      <div style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
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
            情報一覧
          </h1>
          <form
            action="/"
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
            {selectedTagId && (
              <input type="hidden" name="tag" value={selectedTagId} />
            )}
            {selectedType && (
              <input type="hidden" name="type" value={selectedType} />
            )}
            <input
              name="q"
              defaultValue={keyword ?? ""}
              placeholder="タイトル・メモ・タグを検索"
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
            <Link href="/memos" style={{
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
              自由メモ一覧
            </Link>
            <Link href="/resources/new" style={{
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
              ＋ 情報を登録
            </Link>
          </div>
        </div>
        <div style={{
          flex: "none",
          borderBottom: "1px solid #F0F0F0",
          padding: "16px 28px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <div style={{display: "flex", gap: 6}}>
            {RESOURCE_TYPE_FILTERS.map((filter) => {
              const isSelected = selectedType === filter.value
              const count = filter.value
                ? (countByType.get(filter.value) ?? 0)
                : totalCount

              return (
                <Link
                  key={filter.label}
                  href={buildHref({type: filter.value})}
                  style={{
                    height: 30,
                    padding: "0 13px",
                    borderRadius: 6,
                    fontSize: 12.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: isSelected ? "#111111" : undefined,
                    border: isSelected ? "none" : "1px solid #DDDDDD",
                    color: isSelected ? "#FFFFFF" : "#444444",
                  }}
                >
                  {filter.label}
                  <span style={{
                    fontSize: 11.5,
                    color: isSelected ? undefined : "#6E6E6E",
                    opacity: isSelected ? 0.7 : undefined,
                  }}>
                    {count}
                  </span>
                </Link>
              )
            })}
          </div>
          <div style={{
            display: "flex",
            marginLeft: "auto",
          }}>
            <Sort value={selectedSort} />
          </div>
        </div>
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 28px",
        }}>
        {resources.length === 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "80px 0",
            textAlign: "center",
          }}>
            <p style={{fontSize: 14, color: "#444444"}}>
              {keyword
                ? `「${keyword}」に一致する情報はありません。`
                : selectedTagId
                  ? "このタグが付いた情報はありません。"
                  : "まだ情報が登録されていません。"}
            </p>
            {keyword || selectedTagId ? (
              <Link href="/" style={{fontSize: 12.5, color: "#1A66C4"}}>
                すべての情報を見る
              </Link>
            ) : (
              <p style={{fontSize: 12.5, color: "#767676"}}>
                「＋ 情報を登録」から、論文やWebページを追加できます。
              </p>
            )}
          </div>
        )}

        {resources.map((resource) => {
          const badge = RESOURCE_TYPE_BADGE[resource.resource_type]
          return (
        <Link
          key={resource.resource_id}
          href={`/resources/${resource.resource_id}`}
          style={{
          display: "grid",
          gridTemplateColumns: "64px 1fr 260px 96px",
          alignItems: "center",
          gap: 18,
          height: 64,
          borderBottom: "1px solid #F0F0F0",
          color: "#111111",
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
        </Link>
        )})}
        </div>
      </div>
    </div>
  )
}
