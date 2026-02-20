
'use server'

import { db } from "@/db";
import { segments, segmentMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SettingsSchema = z.object({
  shipPlacementOpen: z.boolean(),
  bombingOpen: z.boolean(),
  isPublic: z.boolean(),
});

export async function updateSegmentSettings(segmentId: string, data: z.infer<typeof SettingsSchema>) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

    // Verify Manager
    const membership = await db.query.segmentMembers.findFirst({
        where: and(
            eq(segmentMembers.userId, session.user.id),
            eq(segmentMembers.segmentId, segmentId),
            eq(segmentMembers.role, "manager")
        )
    });

    if (!membership) {
        throw new Error("Only managers can update settings");
    }

    await db.update(segments)
        .set({
            shipPlacementOpen: data.shipPlacementOpen,
            bombingOpen: data.bombingOpen,
            isPublic: data.isPublic,
        })
        .where(eq(segments.id, segmentId));

    revalidatePath(`/dashboard/segment/${segmentId}`);
    revalidatePath(`/dashboard/segment/${segmentId}/settings`);
    return { success: true };
}
