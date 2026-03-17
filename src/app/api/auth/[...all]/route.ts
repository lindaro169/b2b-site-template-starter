import { initAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const POST = async (req: Request) => {
    const auth = await initAuth();
    return toNextJsHandler(auth).POST(req);
}

export const GET = async (req: Request) => {
    const auth = await initAuth();
    return toNextJsHandler(auth).GET(req);
}
