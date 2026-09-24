import { protectedResourceHandler, metadataCorsOptionsRequestHandler} from "mcp-handler";
import {SUPABASE_URL} from "@/lib/supabase/env"

const handler = protectedResourceHandler({
    authServerUrls: [`${SUPABASE_URL}/auth/v1`],
});

const corsHandler = metadataCorsOptionsRequestHandler();

export {handler as GET, corsHandler as OPTIONS};