
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { segments, teams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TeamNav } from "@/components/game/team-nav";

export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch Segment first to check isPublic
  const segment = await db.query.segments.findFirst({
      where: eq(segments.id, id)
  });

  if (!segment) redirect("/dashboard");

  // Get session — may be null for public segments
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // If segment is not public, require authentication
  if (!segment.isPublic && !session) {
    redirect("/signin");
  }

  // Fetch all teams for the nav
  const allTeams = await db.query.teams.findMany({
      where: eq(teams.segmentId, id)
  });

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-slate-50 dark:bg-slate-950">
      <aside className="w-full flex-none md:w-64 bg-white dark:bg-slate-900 border-r p-4 overflow-y-auto">
          <TeamNav 
            segmentId={id} 
            teams={allTeams} 
            userId={session?.user.id ?? null} 
            shipPlacementOpen={segment.shipPlacementOpen}
          />
      </aside>
      <div className="flex-grow md:overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
