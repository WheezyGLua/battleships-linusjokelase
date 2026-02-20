
import { db } from "@/db";
import { teamImmunity, teams, segmentMembers } from "@/db/schema"; // Ensure segmentMembers imported if needed for validation logic
import { eq, and, desc } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { AddImmunityDialog } from "@/components/segment/immunity/add-immunity-dialog";
import { ImmunityList } from "@/components/segment/immunity/immunity-list";

export default async function ImmunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations('Immunity');

  // Fetch all teams for the dialog
  const segmentTeams = await db.select({
      id: teams.id,
      name: teams.name
  }).from(teams).where(eq(teams.segmentId, id));

  // Fetch existing immunities
  // We need to join with teams to get team name
  const immunities = await db.select({
      id: teamImmunity.id,
      teamId: teamImmunity.teamId,
      startTime: teamImmunity.startTime,
      endTime: teamImmunity.endTime,
      message: teamImmunity.message,
      teamName: teams.name
  })
  .from(teamImmunity)
  .innerJoin(teams, eq(teamImmunity.teamId, teams.id))
  .where(eq(teams.segmentId, id))
  .orderBy(desc(teamImmunity.startTime));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <AddImmunityDialog segmentId={id} teams={segmentTeams} />
      </div>

      <ImmunityList immunities={immunities} />
    </div>
  );
}
