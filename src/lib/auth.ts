import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation"
import prisma from "./prisma";

export async function Auth(){
    const supabase = await createClient()
    const {data: {user} } = await supabase.auth.getUser()
    if(!user){
        redirect('/login')
    }
    const id = user.id
    const email = user.email ?? ""
    await prisma.user.upsert({
        where: {user_id: id},
        create: {
            user_id: id,
            email: email,
        },
        update: {},
    })

    return user
}