"use server"
import {createClient} from "@/lib/supabase/server"
import {redirect} from "next/navigation"
import {revalidatePath} from "next/cache"
import {Auth} from "@/lib/auth"
import prisma from "./prisma"
import {ResourceType} from "@/generated/prisma/enums"
import {isFileResourceType} from "@/lib/resource"

export type FormState = {error: string} | null

function isOwnStoragePath(filePath: string, userId: string) {
    return (
        filePath.startsWith(`${userId}/`) &&
        !filePath.includes("..") &&
        !filePath.includes("//")
    )
}

export async function logout(){
    const supabase = await createClient()
    await supabase.auth.signOut()

    redirect("/login")
}

export async function createResource(
    _prevState: FormState,
    formData: FormData,
): Promise<FormState> {
    const user = await Auth()

    const title = String(formData.get("title") ?? "").trim()
    const url = String(formData.get("url") ?? "").trim()
    const memo = String(formData.get("memo") ?? "").trim()
    const resourceType = String(formData.get("resource_type") ?? "")
    const filePath = String(formData.get("file_path") ?? "").trim()
    const fileName = String(formData.get("file_name") ?? "").trim()

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

    if(isFileType && !isOwnStoragePath(filePath, user.id)){
        return {error: "ファイルの保存先が不正です。選び直してください。"}
    }

    const requestedTagIds = formData.getAll("tag_ids").map(String)

    const newTagNames = [
        ...new Set(
            String(formData.get("new_tags") ?? "")
                .split(/\s+/)
                .map((name) => name.trim())
                .filter((name) => name !== ""),
        ),
    ]

    const ownedTags = requestedTagIds.length > 0
        ? await prisma.tag.findMany({
              where: {user_id: user.id, tag_id: {in: requestedTagIds}},
              select: {tag_id: true},
          })
        : []

    const tagIds = new Set(ownedTags.map((tag) => tag.tag_id))

    for (const name of newTagNames) {
        const tag = await prisma.tag.upsert({
            where: {user_id_name: {user_id: user.id, name}},
            update: {},
            create: {user_id: user.id, name},
        })
        tagIds.add(tag.tag_id)
    }

    await prisma.resource.create({
        data: {
            title,
            resource_type: resourceType as ResourceType,
            url: isFileType ? null : url,
            file_path: isFileType ? filePath : null,
            file_name: isFileType && fileName !== "" ? fileName : null,
            memo: memo === "" ? null : memo,
            user_id: user.id,
            resourceTags: {
                create: [...tagIds].map((tag_id) => ({tag_id})),
            },
        }
    })

    revalidatePath("/")
    redirect("/")
}

export async function deleteResource(formData: FormData){
    const user = await Auth()

    const resourceId = String(formData.get("resource_id") ?? "")
    if(resourceId === ""){
        return
    }

    const resource = await prisma.resource.findFirst({
        where: {resource_id: resourceId, user_id: user.id},
        select: {resource_id: true, file_path: true},
    })

    if(!resource){
        return
    }

    if(resource.file_path){
        const supabase = await createClient()
        await supabase.storage.from("resources").remove([resource.file_path])
    }

    await prisma.resource.delete({
        where: {resource_id: resource.resource_id},
    })

    revalidatePath("/")
    redirect("/")
}

export async function updateResource(
    _prevState: FormState,
    formData: FormData,
): Promise<FormState> {
    const user = await Auth()

    const resourceId = String(formData.get("resource_id") ?? "")
    if(resourceId === ""){
        return {error: "更新対象が指定されていません。"}
    }

    const resource = await prisma.resource.findFirst({
        where: {resource_id: resourceId, user_id: user.id},
        select: {resource_id: true, file_path: true},
    })

    if(!resource){
        return {error: "対象の情報が見つかりませんでした。"}
    }

    const title = String(formData.get("title") ?? "").trim()
    const url = String(formData.get("url") ?? "").trim()
    const memo = String(formData.get("memo") ?? "").trim()
    const resourceType = String(formData.get("resource_type") ?? "")
    const filePath = String(formData.get("file_path") ?? "").trim()
    const fileName = String(formData.get("file_name") ?? "").trim()

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

    if(isFileType && !isOwnStoragePath(filePath, user.id)){
        return {error: "ファイルの保存先が不正です。選び直してください。"}
    }

    const requestedTagIds = formData.getAll("tag_ids").map(String)

    const newTagNames = [
        ...new Set(
            String(formData.get("new_tags") ?? "")
                .split(/\s+/)
                .map((name) => name.trim())
                .filter((name) => name !== ""),
        ),
    ]

    const ownedTags = requestedTagIds.length > 0
        ? await prisma.tag.findMany({
              where: {user_id: user.id, tag_id: {in: requestedTagIds}},
              select: {tag_id: true},
          })
        : []

    const tagIds = new Set(ownedTags.map((tag) => tag.tag_id))

    for (const name of newTagNames) {
        const tag = await prisma.tag.upsert({
            where: {user_id_name: {user_id: user.id, name}},
            update: {},
            create: {user_id: user.id, name},
        })
        tagIds.add(tag.tag_id)
    }

    const oldFilePath = resource.file_path
    const shouldRemoveOldFile =
        oldFilePath !== null && oldFilePath !== (isFileType ? filePath : null)

    await prisma.resource.update({
        where: {resource_id: resource.resource_id},
        data: {
            title,
            resource_type: resourceType as ResourceType,
            url: isFileType ? null : url,
            file_path: isFileType ? filePath : null,
            file_name: isFileType && fileName !== "" ? fileName : null,
            memo: memo === "" ? null : memo,
            resourceTags: {
                deleteMany: {},
                create: [...tagIds].map((tag_id) => ({tag_id})),
            },
        },
    })

    if(shouldRemoveOldFile && oldFilePath){
        const supabase = await createClient()
        await supabase.storage.from("resources").remove([oldFilePath])
    }

    revalidatePath("/")
    revalidatePath(`/resources/${resource.resource_id}`)
    redirect(`/resources/${resource.resource_id}`)
}

export async function createMemo(
    _prevState: FormState,
    formData: FormData,
): Promise<FormState> {
    const user = await Auth()
    const title = String(formData.get("title") ?? "").trim()
    const memo = String(formData.get("memo") ?? "").trim()

    if(title === ""){
        return {error: "タイトルを入力してください"}
    }

    await prisma.memo.create({
        data: {
            title,
            memo: memo === "" ? null : memo,
            user_id: user.id
        }
    })
    revalidatePath("/memos")
    redirect("/memos")
}

export async function updateMemo(_prevState: FormState, formData: FormData) : Promise<FormState>{
    const user = await Auth()

    const memoId = String(formData.get("memo_id") ?? "").trim()

    if(memoId === ""){
        return {error: "更新対象が指定されていません。"}
    }

    const existingMemo = await prisma.memo.findFirst({
        where: {memo_id: memoId, user_id: user.id},
        select: {memo_id: true, user_id: true}
    })

    if(!existingMemo){
        return {error: "対象の情報が見つかりませんでした。"}
    }

    const title = String(formData.get("title") ?? "").trim()
    const memo = String(formData.get("memo") ?? "").trim()

    if(title === ""){
        return {error: "タイトルを入力してください"}
    }
    await prisma.memo.update({
        where: {memo_id: memoId},
        data: {
            title,
            memo: memo === "" ? null : memo,
        }
    })
    revalidatePath("/memos")
    redirect("/memos")
}

export async function deleteMemo(_prevState: FormState, formData: FormData) : Promise<FormState>{
    const user = await Auth()
    const memoId = String(formData.get("memo_id") ?? "").trim()

    if(memoId === ""){
        return {error: "削除対象が指定されていません。"}
    }

    const existingMemo = await prisma.memo.findFirst({
        where: {memo_id: memoId, user_id: user.id},
        select: {memo_id: true, user_id: true}
    })

    if(!existingMemo){
        return {error: "対象の情報が見つかりませんでした。"}
    }

    await prisma.memo.delete({where: {memo_id: memoId}})

    revalidatePath("/memos")
    redirect("/memos")
}

export async function createTag(
    _prevState: FormState,
    formData: FormData,
): Promise<FormState> {
    const user = await Auth()

    const name = String(formData.get("name") ?? "").trim()

    if(name === ""){
        return {error: "タグ名を入力してください。"}
    }

    const duplicated = await prisma.tag.findUnique({
        where: {user_id_name: {user_id: user.id, name}},
        select: {tag_id: true},
    })

    if(duplicated){
        return {error: `「${name}」は既にあります。`}
    }

    await prisma.tag.create({
        data: {user_id: user.id, name},
    })

    revalidatePath("/", "layout")
    return null
}

export async function updateTag(
    _prevState: FormState,
    formData: FormData,
): Promise<FormState> {
    const user = await Auth()

    const tagId = String(formData.get("tag_id") ?? "").trim()
    const name = String(formData.get("name") ?? "").trim()

    if(tagId === ""){
        return {error: "更新対象が指定されていません。"}
    }

    if(name === ""){
        return {error: "タグ名を入力してください。"}
    }

    const existingTag = await prisma.tag.findFirst({
        where: {tag_id: tagId, user_id: user.id},
        select: {tag_id: true, name: true},
    })

    if(!existingTag){
        return {error: "対象のタグが見つかりませんでした。"}
    }

    if(existingTag.name === name){
        return null
    }

    const duplicated = await prisma.tag.findUnique({
        where: {user_id_name: {user_id: user.id, name}},
        select: {tag_id: true},
    })

    if(duplicated){
        return {error: `「${name}」は既にあります。`}
    }

    await prisma.tag.update({
        where: {tag_id: existingTag.tag_id},
        data: {name},
    })

    revalidatePath("/", "layout")
    return null
}

export async function deleteTag(
    _prevState: FormState,
    formData: FormData,
): Promise<FormState> {
    const user = await Auth()

    const tagId = String(formData.get("tag_id") ?? "").trim()

    if(tagId === ""){
        return {error: "削除対象が指定されていません。"}
    }

    const existingTag = await prisma.tag.findFirst({
        where: {tag_id: tagId, user_id: user.id},
        select: {tag_id: true},
    })

    if(!existingTag){
        return {error: "対象のタグが見つかりませんでした。"}
    }

    await prisma.tag.delete({
        where: {tag_id: existingTag.tag_id},
    })

    revalidatePath("/", "layout")
    return null
}

export async function updateResourceMemo(
    _prevState: FormState,
    formData: FormData,
): Promise<FormState> {
    const user = await Auth()

    const resourceId = String(formData.get("resource_id") ?? "").trim()
    const memo = String(formData.get("memo") ?? "").trim()

    if(resourceId === ""){
        return {error: "更新対象が指定されていません。"}
    }

    const existingResource = await prisma.resource.findFirst({
        where: {resource_id: resourceId, user_id: user.id},
        select: {resource_id: true},
    })

    if(!existingResource){
        return {error: "対象の情報が見つかりませんでした。"}
    }

    await prisma.resource.update({
        where: {resource_id: existingResource.resource_id},
        data: {memo: memo === "" ? null : memo},
    })

    revalidatePath("/")
    revalidatePath(`/resources/${existingResource.resource_id}`)
    return null
}
