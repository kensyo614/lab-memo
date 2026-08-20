import type {ResourceType} from "@/generated/prisma/enums"

export const RESOURCE_TYPE_BADGE: Record<
  ResourceType,
  {label: string; filterLabel: string; color: string; backgroundColor: string}
> = {
  PDF:    {label: "PDF",    filterLabel: "PDF",       color: "#B14B2C", backgroundColor: "#FDF3EF"},
  WEB:    {label: "WEB",    filterLabel: "Webページ", color: "#1A66C4", backgroundColor: "#F2F7FD"},
  VIDEO:  {label: "動画",   filterLabel: "動画",      color: "#6B4B8A", backgroundColor: "#F6F2F9"},
  GITHUB: {label: "GIT",    filterLabel: "GitHub",    color: "#2F6B4F", backgroundColor: "#F0F6F2"},
  OTHER:  {label: "その他", filterLabel: "その他",    color: "#767676", backgroundColor: "#F2F2F2"},
}

export const RESOURCE_TYPE_FILTERS: {value: ResourceType | undefined; label: string}[] = [
  {value: undefined, label: "すべて"},
  ...(Object.keys(RESOURCE_TYPE_BADGE) as ResourceType[]).map((value) => ({
    value,
    label: RESOURCE_TYPE_BADGE[value].filterLabel,
  })),
]

export function formatDate(date: Date) {
  return date.toLocaleDateString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  })
}

export function formatFullDate(date: Date) {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  })
}

export function isFileResourceType(type: ResourceType) {
  return type === "PDF" || type === "OTHER"
}
