'use server'

import { db } from "@/db";
import { teams, teamMembers, ships, bombs, bombingPhases, teamImmunity, segments } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql, lt, gt, lte, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface ShipData {
    id: string; // temp id from client
    type: string;
    size: number;
    startX: number;
    startY: number;
    orientation: "horizontal" | "vertical";
}

export async function saveShips(segmentId: string, shipsData: ShipData[]) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

    // Check if segment is open for placement
    const segment = await db.query.segments.findFirst({
        where: eq(segments.id, segmentId)
    });

    if (!segment?.shipPlacementOpen) {
        throw new Error("Ship placement is closed");
    }

    // Verify User is Captain of a Team in this Segment
    const membership = await db.select({
        teamId: teamMembers.teamId,
        role: teamMembers.role
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(and(
        eq(teamMembers.userId, session.user.id),
        eq(teamMembers.role, "captain"),
        eq(teams.segmentId, segmentId)
    ));

    if (membership.length === 0) {
        throw new Error("You are not a captain of any team in this segment");
    }

    const teamId = membership[0].teamId;

    // Transaction: Delete old ships, insert new
    await db.transaction(async (tx) => {
        await tx.delete(ships).where(eq(ships.teamId, teamId));
        
        if (shipsData.length > 0) {
            await tx.insert(ships).values(shipsData.map(s => ({
                id: crypto.randomUUID(),
                teamId,
                type: s.type,
                size: s.size,
                startX: s.startX,
                startY: s.startY,
                orientation: s.orientation
            })));
        }
    });

    revalidatePath(`/dashboard/segment/${segmentId}/game/setup`);
    return { success: true };
}

// ----------------------------------------------------------------------
// Place Bomb
// ----------------------------------------------------------------------
export async function placeBomb(
    segmentId: string, 
    targetTeamId: string, 
    x: number, 
    y: number,
    phaseId: string
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

    // Fetch Phase
    const phase = await db.query.bombingPhases.findFirst({
        where: eq(bombingPhases.id, phaseId)
    });

    if (!phase) throw new Error("Phase not found");

    // Check Lock Time (placementEndTime is when bomb placement closes)
    if (phase.placementEndTime && new Date() >= phase.placementEndTime) {
        throw new Error("This bombing phase is locked");
    }

    // Check segment settings
    const segment = await db.query.segments.findFirst({
        where: eq(segments.id, segmentId)
    });

    if (!segment?.bombingOpen) { // Assuming admin can bypass? Prompt says "manager ... change settings ... allowed to place bombs".
        // Assuming "bombingOpen" means placement is allowed.
        throw new Error("Bombing phase is closed");
    }

    // Get User's Team (Source)
    const sourceMembership = await db.select({
        teamId: teamMembers.teamId,
        role: teamMembers.role
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(and(
        eq(teamMembers.userId, session.user.id),
        eq(teams.segmentId, segmentId)
    ));
    
    if (!sourceMembership[0]) {
        throw new Error("You are not part of any team in this segment");
    }

    const sourceTeamId = sourceMembership[0].teamId;
    const userRole = sourceMembership[0].role;

    // Fetch Source Team (for Type and Bombs)
    const sourceTeam = await db.query.teams.findFirst({
        where: eq(teams.id, sourceTeamId)
    });

    if (!sourceTeam) throw new Error("Team not found");

    const isAdminTeam = sourceTeam.type === 'admin';

    // Permission Check: Admin Team OR (Captain/Bomber)
    if (!isAdminTeam && userRole !== "captain" && userRole !== "bomber") {
        throw new Error("Only captains, bombers, or admin team members can place bombs");
    }

    if (sourceTeamId === targetTeamId) {
        throw new Error("Cannot bomb your own team");
    }

    if (sourceTeam.bombsAvailable <= 0) {
        throw new Error("No bombs available");
    }

    // Check if cell already bombed (by anyone? or by this team?)
    // "visible for all players" after release.
    // "schedule... when bombs shoul release and be hitting ... visible".
    // Before release, can multiple teams bomb same spot? Yes.
    // But uniqueness? "status: hit/miss".
    // If Team A bombs (1,1) -> Pending.
    // Team B bombs (1,1) -> Pending.
    // Resolution?
    // User request: "One date and time for when the bombs shoul release and be hitting their targets".
    // Implies executed at once.
    // If I allow duplicates, I need to handle multiple results.
    // I'll assume YES, multiple teams can bomb same spot.
    
    // But can ONE team bomb same spot twice? No.
    const existingBomb = await db.query.bombs.findFirst({
        where: and(
            eq(bombs.targetTeamId, targetTeamId),
            eq(bombs.sourceTeamId, sourceTeamId),
            eq(bombs.x, x),
            eq(bombs.y, y)
        )
    });
    
    if (existingBomb) {
        throw new Error("Already bombed this location");
    }

    // Determine Hit or Miss?
    // "visible for all players" implies we calculate result now but maybe hide it?
    // If we calculate now, we store it.
    // Check if ship exists at x,y on target team.
    const targetShip = await db.query.ships.findFirst({
        where: and(
            eq(ships.teamId, targetTeamId),
            // Check logic: horizontal or vertical coverage
            // This is hard in SQL without precise x/y check or loading all ships.
            // Easier to load all ships for target team and check in memory (max 5 ships).
        )
    });
    
    // Better: Fetch all ships for target team.
    const targetShips = await db.select().from(ships).where(eq(ships.teamId, targetTeamId));
    
    let status: "hit" | "miss" | "pending" = "miss";
    // Check hit
    for (const ship of targetShips) {
        if (ship.orientation === "horizontal") {
            if (y === ship.startY && x >= ship.startX && x < ship.startX + ship.size) {
                status = "hit";
                break;
            }
        } else {
            if (x === ship.startX && y >= ship.startY && y < ship.startY + ship.size) {
                status = "hit";
                break;
            }
        }
    }
    
    // If bombReleaseTime is future, status should be 'pending'?
    // "date and time for when the bombs shoul release and be hitting their targets and be visible".
    // "visible" implies the RESULT is hidden.
    // Does "hitting their targets" mean the calculation happens later?
    // If I calculate now and store "hit", and user inspects network/DB, they see it.
    // Secure way: Store "pending" and have a cron job or "Check Result" on read-time.
    // Simpler: Store `pending` if `now < releaseTime`?
    // But `status` enum has `pending`.
    // Let's store `pending` if `now < releaseTime`.
    // BUT, `bombReleaseTime` is on Segment.
    // If I store `hit/miss` now, I can just HIDE it in UI based on time.
    // Check if `segment.bombReleaseTime` is set and in future.
    let isReleased = true;
    if (segment?.bombReleaseTime && new Date() < segment.bombReleaseTime) {
        isReleased = false;
    }
    
    // If not released, do we still calculate hit?
    // The requirement "bombs ... be hitting their targets" at that time suggests the event happens then.
    // But usually in these games, you place the bomb and result is revealed later.
    // I will store the *actual* result in `status`, but UI will mask it if not released?
    // Or I store `pending` and resolve it later?
    // Resolving later requires a trigger/script.
    // Masking in UI is easier but leaks info if API is inspected (unless API masks it).
    // I'll implement masking in the Data Access Layer (Page/API).
    // So here I save the Real Result.
    
    await db.transaction(async (tx) => {
        // Insert Bomb
        await tx.insert(bombs).values({
            id: crypto.randomUUID(),
            segmentId,
            sourceTeamId,
            targetTeamId,
            phaseId,
            x,
            y,
            status: status, // Store strict result
            placedByUserId: session.user.id
        });

        // Decrement bombs available
        await tx.update(teams)
            .set({ bombsAvailable: sourceTeam.bombsAvailable - 1 })
            .where(eq(teams.id, sourceTeamId));
    });

    revalidatePath(`/dashboard/segment/${segmentId}/game/board/${targetTeamId}`);
    return { success: true, result: isReleased ? status : "pending" };
}
