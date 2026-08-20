"use server"
import {createClient} from "@/lib/supabase/server"
import {redirect} from "next/navigation"
import {revalidatePath} from "next/cache"
import {Auth} from "@/lib/auth"
import prisma from "./prisma"
import {ResourceType} from "@/generated/prisma/enums"

export async function logout(){
    const supabase = await createClient()
    await supabase.auth.signOut()

    redirect("/login")
}

export async function createResource(formData: FormData){
    const user = await Auth()

    const title = String(formData.get("title") ?? "").trim()
    const url = String(formData.get("url") ?? "").trim()
    const memo = String(formData.get("memo") ?? "").trim()
    const resourceType = String(formData.get("resource_type") ?? "")
    const filePath = String(formData.get("file_path") ?? "").trim()

    if(title === ""){
        return
    }

    if(!(resourceType in ResourceType)){
        return
    }

    const isFileType = resourceType === "PDF" || resourceType === "OTHER"

    if(isFileType && filePath === ""){
        return
    }
    if(!isFileType && url === ""){
        return
    }

    if(isFileType && !filePath.startsWith(`${user.id}/`)){
        return
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
