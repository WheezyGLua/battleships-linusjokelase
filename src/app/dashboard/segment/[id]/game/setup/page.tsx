
import { db } from "@/db";
import { segments, teams, teamMembers, ships } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { BoardGrid } from "@/components/game/board-grid";
import { SetupBoard } from "@/components/game/setup-board"; // Client component wrapper for state

export default async function ShipSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) redirect("/signin");

  const segment = await db.query.segments.findFirst({
      where: eq(segments.id, id)
  });

  if (!segment?.shipPlacementOpen) {
      return (
          <div className="flex h-full items-center justify-center">
              <div className="text-center p-8 bg-neutral-100 rounded-lg">
                  <h2 className="text-xl font-bold mb-2">Ship Placement Closed</h2>
                  <p>The manager has closed or not yet opened the ship placement phase.</p>
              </div>
          </div>
      );
  }

  // Check valid captain
  const membership = await db.select({
      teamId: teamMembers.teamId,
      teamName: teams.name
  })
  .from(teamMembers)
  .innerJoin(teams, eq(teamMembers.teamId, teams.id))
  .where(and(
      eq(teamMembers.userId, session.user.id),
      eq(teamMembers.role, "captain"),
      eq(teams.segmentId, id)
  ));

  if (membership.length === 0) {
       return (
          <div className="flex h-full items-center justify-center">
              <div className="text-center p-8 bg-neutral-100 rounded-lg">
                  <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                  <p>Only team captains can place ships.</p>
              </div>
          </div>
      );
  }
  
  const teamId = membership[0].teamId;

  // Fetch existing ships
  const existingShips = await db.select().from(ships).where(eq(ships.teamId, teamId));

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Ship Placement - {membership[0].teamName}</h1>
        <SetupBoard 
            segmentId={id} 
            teamId={teamId} 
            initialShips={existingShips as any[]} // type cast or fix schema type
        />
    </div>
  );
}
