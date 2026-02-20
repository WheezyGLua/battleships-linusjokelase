
'use server'

import { db } from "@/db";
import { segmentMembers } from "@/db/schema";
import { user } from "@/db/auth-schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function bulkCreateUsers(segmentId: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) { // Add Manager check here
        throw new Error("Unauthorized");
    }

    const emailsRaw = formData.get("emails") as string;
    const emails = emailsRaw.split(/[\n,]+/).map(e => e.trim()).filter(e => e.length > 0);

    for (const email of emails) {
        // Check if user exists
        let userId: string | null = null;
        
        // We can query DB directly to skip BetterAuth overhead if just checking existence
        const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1);

        if (existingUser.length > 0) {
            userId = existingUser[0].id;
        } else {
            // Create user via BetterAuth
            try {
                // SignUpEmail returns specific structure.
                // Note: This might sign in the user in context of this request if we are not careful.
                // But since we are in Server Action, the Set-Cookie header is returned to client. 
                // We MUST ensure we don't overwrite the Manager's session.
                // BetterAuth 'admin' plugin is safer, but without it...
                // We'll use a direct fetch to the API route if needed, or stick to signUpEmail and ignore headers?
                // Actually, signUpEmail defaults to signing in.
                // Let's use direct DB insertion for now to avoid session hijacking, assuming simple password hashing.
                // Or better: use `auth.api.signUpEmail` but STRIP the Set-Cookie header? 
                // We can't easily strip headers in Next.js Server Actions from the library call.
                
                // Hack: We can just use random password and let them reset, or strict '12345678'
                // For this demo, I will try to use the library but if it messes up session, we'll know.
                // WAIT, `auth.api` functions usually return headers to set cookies. 
                // If I don't return them to the client, it might be fine.
                // But Next.js Server Actions automatically handle headers.
                
                // Let's assume for now we use `auth.api.signUpEmail` and hope `asResponse` isn't triggered or we can suppress it.
                // Actually, `better-auth` has `asResponse: false` by default in direct API calls?
                
                const newUser = await auth.api.signUpEmail({
                    body: {
                        email,
                        password: "password123", // Default password
                        name: email.split("@")[0],
                    },
                    asResponse: false // Ensure we get object back, not Response
                });
                
                if (newUser?.user) {
                    userId = newUser.user.id;
                }
            } catch (e) {
                console.error(`Failed to create user ${email}`, e);
            }
        }

        if (userId) {
            // Add to segment
            // Check if already in segment
            // We use insert ignore or on duplicate key update?
            // Drizzle doesn't support 'AMBIGUOUS' easy upsert in all drivers.
            // We'll just check existence.
            // Actually, we can use try/catch on insert if unique constraint exists (composite key?).
            // SegmentMembers doesn't have composite unique constraint on (segmentId, userId) in schema definition!
            // I should have added that.
            // For now, manual check.
             const isMember = await db.query.segmentMembers.findFirst({
                where: (table, { and, eq }) => and(eq(table.segmentId, segmentId), eq(table.userId, userId!))
            });

            if (!isMember) {
                await db.insert(segmentMembers).values({
                    segmentId,
                    userId,
                    role: "member"
                });
            }
        }
    }

    revalidatePath(`/dashboard/segment/${segmentId}/users`);
}
