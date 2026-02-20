
'use server'

import { db } from "@/db";
import { segmentMembers } from "@/db/schema";
import { user as userSchema } from "@/db/auth-schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addManager(segmentId: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return { error: "Unauthorized" };

    // Check acting user is manager
    const membership = await db.query.segmentMembers.findFirst({
        where: and(
            eq(segmentMembers.userId, session.user.id),
            eq(segmentMembers.segmentId, segmentId),
            eq(segmentMembers.role, "manager")
        )
    });
    
    if (!membership) return { error: "Unauthorized" };

    const email = formData.get("email") as string;
    
    // Find user by email
    const [targetUser] = await db.select().from(userSchema).where(eq(userSchema.email, email));
    
    if (!targetUser) return { error: "User not found" };

    // Check if already member
    const existing = await db.query.segmentMembers.findFirst({
        where: and(
            eq(segmentMembers.userId, targetUser.id),
            eq(segmentMembers.segmentId, segmentId)
        )
    });

    if (existing) {
        if (existing.role === "manager") return { error: "Already a manager" };
        // Update to manager?
        await db.update(segmentMembers)
            .set({ role: "manager" })
            .where(eq(segmentMembers.id, existing.id));
    } else {
        // Insert as manager
        await db.insert(segmentMembers).values({
            id: crypto.randomUUID(),
            segmentId,
            userId: targetUser.id,
            role: "manager"
        });
    }

    revalidatePath(`/dashboard/segment/${segmentId}/users/managers`);
    return { success: true };
}

export async function removeManager(segmentId: string, membershipId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

     const membership = await db.query.segmentMembers.findFirst({
        where: and(
            eq(segmentMembers.userId, session.user.id),
            eq(segmentMembers.segmentId, segmentId),
            eq(segmentMembers.role, "manager")
        )
    });
    
    if (!membership) throw new Error("Unauthorized");

    await db.delete(segmentMembers).where(eq(segmentMembers.id, membershipId));
    
    revalidatePath(`/dashboard/segment/${segmentId}/users/managers`);
}
