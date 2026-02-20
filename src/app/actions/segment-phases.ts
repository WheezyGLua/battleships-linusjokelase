
'use server'

import { db } from "@/db";
import { bombingPhases, segmentMembers, phaseTeamConfigs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPhase(segmentId: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

    // Manager Check
    const membership = await db.query.segmentMembers.findFirst({
        where: and(
            eq(segmentMembers.userId, session.user.id),
            eq(segmentMembers.segmentId, segmentId),
            eq(segmentMembers.role, "manager")
        )
    });

    if (!membership) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const placementStartTimeStr = formData.get("placementStartTime") as string;
    const placementEndTimeStr = formData.get("placementEndTime") as string;
    const releaseTimeStr = formData.get("releaseTime") as string;
    
    const webhookId = formData.get("webhookId") as string;
    const webhookMessage = formData.get("webhookMessage") as string;
    const webhookTimeStr = formData.get("webhookTime") as string;

    const phaseId = crypto.randomUUID();

    // Extract limits
    const teamLimits: { teamId: string, limit: number }[] = [];
    for (const key of Array.from(formData.keys())) {
        if (key.startsWith("limit_")) {
            const val = formData.get(key);
            if (val && val.toString().trim() !== "") {
                 const teamId = key.replace("limit_", "");
                 teamLimits.push({ teamId, limit: parseInt(val.toString()) });
            }
        }
    }

    await db.transaction(async (tx) => {
        await tx.insert(bombingPhases).values({
            id: phaseId,
            segmentId,
            name,
            placementStartTime: new Date(placementStartTimeStr),
            placementEndTime: new Date(placementEndTimeStr),
            releaseTime: releaseTimeStr ? new Date(releaseTimeStr) : null,
            webhookId: webhookId && webhookId !== "none" ? webhookId : null,
            webhookMessage: webhookMessage || null,
            webhookTime: webhookTimeStr ? new Date(webhookTimeStr) : (releaseTimeStr ? new Date(releaseTimeStr) : null),
            isBombsReleased: false,
        });

        if (teamLimits.length > 0) {
            // Need to import phaseTeamConfigs inside action or verify import
            // I'll assume it's imported in schema or I need to add it to imports
            // Since it's server action, I can add import if missing, but `replace_file_content` checks context.
            // I'll add `phaseTeamConfigs` to imports in a separate Edit if needed, but let's try to assume it's available or use `db.insert...`
            // Wait, I need the schema object to insert.
            
            // Note: I will update imports in the same tool call if possible, but file content replacement is contiguous.
            // I'll assume phaseTeamConfigs is NOT in imports yet (Step 113 showed bombingPhases, segmentMembers).
            
            // I will update the imports separately or in a wider range.
            await tx.insert(phaseTeamConfigs).values(teamLimits.map(tl => ({
                phaseId,
                teamId: tl.teamId,
                bombLimit: tl.limit
            })));
        }
    });

    revalidatePath(`/dashboard/segment/${segmentId}/phases`);
}

export async function duplicatePhase(phaseId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) throw new Error("Unauthorized");

    // Fetch original phase
    const originalPhase = await db.query.bombingPhases.findFirst({
        where: eq(bombingPhases.id, phaseId)
    });

    if (!originalPhase) throw new Error("Phase not found");

    // Check permissions
    const membership = await db.query.segmentMembers.findFirst({
        where: and(
            eq(segmentMembers.segmentId, originalPhase.segmentId),
            eq(segmentMembers.userId, session.user.id),
            eq(segmentMembers.role, "manager")
        )
    });
    if (!membership) throw new Error("Unauthorized");

    // Fetch configs
    const configs = await db.select().from(phaseTeamConfigs).where(eq(phaseTeamConfigs.phaseId, phaseId));

    // Calculate new dates (+1 Day)
    const addOneDay = (date: Date) => new Date(date.getTime() + 24 * 60 * 60 * 1000);

    const newPhaseId = crypto.randomUUID();

    await db.transaction(async (tx) => {
        await tx.insert(bombingPhases).values({
            id: newPhaseId,
            segmentId: originalPhase.segmentId,
            name: `${originalPhase.name} (Copy)`,
            placementStartTime: addOneDay(originalPhase.placementStartTime),
            placementEndTime: addOneDay(originalPhase.placementEndTime),
            releaseTime: originalPhase.releaseTime ? addOneDay(originalPhase.releaseTime) : null,
            webhookId: originalPhase.webhookId,
            webhookMessage: originalPhase.webhookMessage,
            webhookTime: originalPhase.webhookTime ? addOneDay(originalPhase.webhookTime) : null,
            isBombsReleased: false,
        });

        if (configs.length > 0) {
            await tx.insert(phaseTeamConfigs).values(configs.map(c => ({
                phaseId: newPhaseId,
                teamId: c.teamId,
                bombLimit: c.bombLimit
            })));
        }
    });

    revalidatePath(`/dashboard/segment/${originalPhase.segmentId}/phases`);
}

export async function setPhaseStatus(phaseId: string, action: 'open' | 'close' | 'release') {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) throw new Error("Unauthorized");

    const phase = await db.query.bombingPhases.findFirst({
        where: eq(bombingPhases.id, phaseId)
    });
    if (!phase) throw new Error("Phase not found");

    // Manager Check
    const membership = await db.query.segmentMembers.findFirst({
        where: and(
            eq(segmentMembers.segmentId, phase.segmentId),
            eq(segmentMembers.userId, session.user.id),
            eq(segmentMembers.role, "manager")
        )
    });
    if (!membership) throw new Error("Unauthorized");

    const now = new Date();

    if (action === 'open') {
        // Set start time to now, end time to future (keep duration or set to +1 hour)
        // Or strictly: start = now, end = max(end, now + 1h)
        await db.update(bombingPhases).set({
            placementStartTime: now,
            // Ensure end time is in future if it was passed
            placementEndTime: phase.placementEndTime < now ? new Date(now.getTime() + 3600000) : phase.placementEndTime
        }).where(eq(bombingPhases.id, phaseId));
    } else if (action === 'close') {
         await db.update(bombingPhases).set({
            placementEndTime: now
        }).where(eq(bombingPhases.id, phaseId));
    } else if (action === 'release') {
         await db.update(bombingPhases).set({
            isBombsReleased: true,
            releaseTime: now
        }).where(eq(bombingPhases.id, phaseId));
    }

    revalidatePath(`/dashboard/segment/${phase.segmentId}/phases`);
}

// TODO: testWebhook
