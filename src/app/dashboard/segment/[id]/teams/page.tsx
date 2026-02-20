import { db } from "@/db";
import { segmentMembers, teams, teamMembers } from "@/db/schema";
import { user as userTable } from "@/db/auth-schema";
import { eq } from "drizzle-orm";
import { CreateTeamDialog } from "@/components/segment/create-team-dialog";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { ManageTeamDialog } from "@/components/segment/manage-team-dialog";
import { getTranslations } from 'next-intl/server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function SegmentTeamsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations('Common');
  // Need session to check if manager
  const session = await auth.api.getSession({ headers: await headers() });
  const isManager = session?.user && (await db.query.segmentMembers.findFirst({
      where: (fields, { and, eq }) => and(
          eq(fields.segmentId, id),
          eq(fields.userId, session.user.id),
          eq(fields.role, "manager")
      )
  }));
  
  // Fetch users for captain selection
  const users = await db.select({
      id: userTable.id,
      name: userTable.name,
  })
  .from(segmentMembers)
  .innerJoin(userTable, eq(segmentMembers.userId, userTable.id))
  .where(eq(segmentMembers.segmentId, id));

  const allTeams = await db.select().from(teams).where(eq(teams.segmentId, id));
  
  const allTeamMembers = await db.select({
      teamId: teamMembers.teamId,
      userId: teamMembers.userId,
      role: teamMembers.role,
      name: userTable.name
  })
  .from(teamMembers)
  .innerJoin(teams, eq(teamMembers.teamId, teams.id))
  .innerJoin(userTable, eq(teamMembers.userId, userTable.id))
  .where(eq(teams.segmentId, id));
  
  const teamsWithDetails = allTeams.map(t => {
      const captain = allTeamMembers.find(m => m.teamId === t.id && m.role === "captain");
      const memberCount = allTeamMembers.filter(m => m.teamId === t.id).length;
      return { ...t, captainName: captain?.name || "None", memberCount };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('teams')}</h1>
        {isManager && <CreateTeamDialog segmentId={id} users={users} />}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamsWithDetails.map(team => (
              <Card key={team.id} className={team.type === 'admin' ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}>
                  <CardHeader>
                      <div className="flex justify-between">
                        <CardTitle>{team.name}</CardTitle>
                        {team.type === 'admin' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Admin</span>}
                      </div>
                      <CardDescription>Captain: {team.captainName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm">Members: {team.memberCount}</p>
                      <p className="text-sm">Bombs: {team.bombsAvailable}</p>
                  </CardContent>
                  {isManager && (
                    <CardFooter>
                        <ManageTeamDialog team={team} />
                    </CardFooter>
                  )}
              </Card>
          ))}
      </div>
    </div>
  );
}
