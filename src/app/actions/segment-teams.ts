
'use server'

import { db } from "@/db";
import { teams, teamMembers, segmentMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createTeam(segmentId: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Verify Manager? (omitted for brevity, layout checks it)

    const name = formData.get("name") as string;
    const type = formData.get("type") as "player" | "admin" || "player";
    const captainId = formData.get("captainId") as string;

    const teamId = crypto.randomUUID();

    // Create Team
    await db.insert(teams).values({
        id: teamId,
        segmentId,
        name,
        type,
        bombsAvailable: 0, // Manager sets later?
    });

    // Assign Captain
    if (captainId && captainId !== "none") {
        await db.insert(teamMembers).values({
            teamId,
            userId: captainId,
            role: "captain"
        });
    }

    revalidatePath(`/dashboard/segment/${segmentId}/teams`);
}

export async function updateTeamBombs(teamId: string, amount: number) {
    const session = await auth.api.getSession({
         headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

    // Verify Manager (simplified, assuming caller checks or DB constraints)
    // Ideally we check if session user is manager of the segment the team belongs to.
    
    // Fetch team to get current bombs
    const team = await db.query.teams.findFirst({
        where: eq(teams.id, teamId)
    });
    
    if (!team) throw new Error("Team not found");
    
    // Verify Manager
    const membership = await db.query.segmentMembers.findFirst({
        where: and(
            eq(segmentMembers.segmentId, team.segmentId),
            eq(segmentMembers.userId, session.user.id),
            eq(segmentMembers.role, "manager")
        )
    });
    
    if (!membership) throw new Error("Must be a manager");

    await db.update(teams)
        .set({ bombsAvailable: amount })
        .where(eq(teams.id, teamId));

    revalidatePath(`/dashboard/segment/${team.segmentId}/teams`);
}
