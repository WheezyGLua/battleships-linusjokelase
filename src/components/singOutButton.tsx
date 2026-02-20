'use client'
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { redirect } from "next/navigation";

export function SignOutButton() {
    return (
        <Button onClick={() => authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    redirect("/signin")
                }
            }
        })}>Logga ut</Button>
    )
}
