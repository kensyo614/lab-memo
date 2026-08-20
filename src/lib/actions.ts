"use server"
import {createClient} from "@/lib/supabase/server"
import {redirect} from "next/navigation"
import {revalidatePath} from "next/cache"
import {Auth} from "@/lib/auth"
import prisma from "./prisma"
import {ResourceType} from "@/generated/prisma/enums"
import {isFileResourceType} from "@/lib/resource"

export type FormState = {error: string} | null

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

    if(title === ""){
        return {error: "タイトルを入力してください。"}
    }

    if(!(resourceType in ResourceType)){
        return {error: "種類を選んでください。"}
    }

    const isFileType = resourceType === "PDF" || resourceType === "OTHER"

    if(isFileType && filePath === ""){
        return {error: "ファイルを選択してください。"}
    }
    if(!isFileType && url === ""){
        return {error: "URL を入力してください。"}
    }

    if(isFileType && !filePath.startsWith(`${user.id}/`)){
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

    if(isFileType && !filePath.startsWith(`${user.id}/`)){
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
