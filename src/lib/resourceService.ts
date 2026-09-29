import prisma from "@/lib/prisma"
import {ResourceType} from "@/generated/prisma/enums"
import {isFileResourceType} from "@/lib/resource"

export function isOwnStoragePath(filePath: string, userId: string) {
    return (
        filePath.startsWith(`${userId}/`) &&
        !filePath.includes("..") &&
        !filePath.includes("//")
    )
}

export type CreateResourceInput = {
    title: string
    resourceType: string
    url: string
    filePath: string
    fileName: string
    note: string
    tagIds: string[]
    tagNames: string[]
}

export type CreateResourceResult = {resourceId: string} | {error: string}

export async function createResourceForUser(
    userId: string,
    input: CreateResourceInput,
): Promise<CreateResourceResult> {
    const title = input.title.trim()
    const url = input.url.trim()
    const note = input.note.trim()
    const resourceType = input.resourceType.trim()
    const filePath = input.filePath.trim()
    const fileName = input.fileName.trim()

    if(title === ""){
        return {error: "タイトルを入力してください。"}
    }

    if(!(resourceType in ResourceType)){
        return {error: "種類を選んでください。"}
    }

    const isFileType = isFileResourceType(resourceType as ResourceType)

    if(isFileType && filePath === ""){
        return {error: "ファイルを選択してください。"}
    }
    if(!isFileType && url === ""){
        return {error: "URL を入力してください。"}
    }

    if(isFileType && !isOwnStoragePath(filePath, userId)){
        return {error: "ファイルの保存先が不正です。選び直してください。"}
    }

    const tagIds = await resolveTagIds(userId, input.tagIds, input.tagNames)

    const resource = await prisma.resource.create({
        data: {
            title,
            resource_type: resourceType as ResourceType,
            url: isFileType ? null : url,
            file_path: isFileType ? filePath : null,
            file_name: isFileType && fileName !== "" ? fileName : null,
            note: note === "" ? null : note,
            user_id: userId,
            resourceTags: {
                create: tagIds.map((tag_id) => ({tag_id})),
            },
        },
        select: {resource_id: true},
    })

    return {resourceId: resource.resource_id}
}

async function resolveTagIds(
    userId: string,
    requestedTagIds: string[],
    requestedTagNames: string[],
): Promise<string[]> {
    const tagNames = [
        ...new Set(
            requestedTagNames
                .map((name) => name.trim())
                .filter((name) => name !== ""),
        ),
    ]

    const ownedTags = requestedTagIds.length > 0
        ? await prisma.tag.findMany({
              where: {user_id: userId, tag_id: {in: requestedTagIds}},
              select: {tag_id: true},
          })
        : []

    const tagIds = new Set(ownedTags.map((tag) => tag.tag_id))

    for (const name of tagNames) {
        const tag = await prisma.tag.upsert({
            where: {user_id_name: {user_id: userId, name}},
            update: {},
            create: {user_id: userId, name},
        })
        tagIds.add(tag.tag_id)
    }

    return [...tagIds]
}
