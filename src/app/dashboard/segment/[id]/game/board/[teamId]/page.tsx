
import { db } from "@/db";
import { segments, teams, teamMembers, ships, bombs, bombingPhases } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { BombingBoard } from "@/components/game/bombing-board";
import { BoardGrid } from "@/components/game/board-grid";

export default async function TeamBoardPage({
  params,
}: {
  params: Promise<{ id: string; teamId: string }>;
}) {
  const { id, teamId } = await params;
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) redirect("/signin");

  const segment = await db.query.segments.findFirst({
      where: eq(segments.id, id)
  });

  // Get User's Team
  const myMembership = await db.select({
      teamId: teamMembers.teamId,
      role: teamMembers.role,
      teamBombs: teams.bombsAvailable
  })
  .from(teamMembers)
  .innerJoin(teams, eq(teamMembers.teamId, teams.id))
  .where(and(
      eq(teamMembers.userId, session.user.id),
      eq(teams.segmentId, id)
  ));
  
  const myTeamId = myMembership[0]?.teamId;
  const isMyTeam = myTeamId === teamId;
  const isCaptainOrBomber = myMembership[0]?.role === "captain" || myMembership[0]?.role === "bomber";

  // Fetch Phases
  const phases = await db.query.bombingPhases.findMany({
      where: eq(bombingPhases.segmentId, id),
      orderBy: (phases, { asc }) => [asc(phases.releaseTime)]
  });

  // Fetch Bombs on Target Team
  const targetBombs = await db.select().from(bombs).where(eq(bombs.targetTeamId, teamId));
  
  const now = new Date();
  
  const visibleBombs = targetBombs.map(b => {
      const isMyBomb = b.sourceTeamId === myTeamId;
      
      // Determine if released
      let isReleased = false;
      if (b.phaseId) {
          const phase = phases.find(p => p.id === b.phaseId);
          if (phase && phase.releaseTime && now >= phase.releaseTime) {
              isReleased = true;
          }
      } else {
          // Legacy or fallback: Check segment release time? 
          // For now, let's say if no phaseId, use segment global time if exists, else released?
          // Simplest: If no phase, treat as released (or pending if we want valid migration).
          // Let's assume released to avoid hiding old data.
          isReleased = true;
      }

      if (isReleased) {
          return { x: b.x, y: b.y, status: b.status as "hit" | "miss", phaseId: b.phaseId };
      } else {
          if (isMyBomb) {
             return { x: b.x, y: b.y, status: "pending" as "pending", phaseId: b.phaseId };
          } else {
              return null;
          }
      }
  }).filter(b => b !== null) as { x: number; y: number; status: "hit" | "miss" | "pending"; phaseId?: string | null }[];


  if (isMyTeam) {
     // VIEW MODE: My Board
     const myShips = await db.select().from(ships).where(eq(ships.teamId, teamId));
     
     return (
         <div className="p-6">
             <h1 className="text-2xl font-bold mb-4">My Team Board</h1>
             <div className="flex gap-8">
                <div>
                     <h3 className="font-bold mb-2">Our Grid</h3>
                     <BoardGrid 
                        ships={myShips as any} 
                        bombs={visibleBombs}
                        interactive={false} // View only
                        orientation="horizontal"
                     />
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-slate-100 dark:bg-zinc-800 rounded">
                        <h4 className="font-semibold">Incoming Strikes</h4>
                        <p className="text-sm">
                            {visibleBombs.filter(b => b.status === 'hit' || b.status === 'miss').length} bombs revealed.
                        </p>
                    </div>
                </div>
             </div>
         </div>
     )
  } else {
      // BOMBING MODE: Target Board
      
      // Can I bomb?
      // Manager setting: bombingOpen AND (My Role: Captain/Bomber/Admin) AND (My Team Bombs > 0)
      
      const canBomb = !!segment?.bombingOpen && isCaptainOrBomber && (myMembership[0]?.teamBombs || 0) > 0;

      return (
          <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Target: Remote Team</h1>
              
               <div className="flex justify-between items-center mb-4">
                 <div>
                     <span className="font-bold">Bombs Available: </span>
                     <span className={(myMembership[0]?.teamBombs || 0) > 0 ? "text-green-600" : "text-red-600"}>
                        {myMembership[0]?.teamBombs || 0}
                     </span>
                 </div>
             </div>

              <div className="flex flex-col gap-6">
                  {phases.length > 0 ? (
                      <BombingBoard 
                        segmentId={id} 
                        targetTeamId={teamId} 
                        bombs={visibleBombs}
                        phases={phases}
                      />
                  ) : (
                      <div className="p-8 border rounded-lg text-center bg-muted">
                          <p>No bombing phases available.</p>
                      </div>
                  )}
              </div>
          </div>
      )
  }
}
