import { createAuthClient } from "better-auth/react";

function getAuthBaseURL() {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    return process.env.NEXT_PUBLIC_WEBSITE || "http://localhost:3002";
}

export const authClient = createAuthClient({
    baseURL: getAuthBaseURL(),
});
