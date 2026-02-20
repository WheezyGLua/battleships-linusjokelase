
import { db } from "@/db";
import { bombingPhases, webhooks, teams } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { CreatePhaseDialog } from "@/components/segment/phases/create-phase-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PhaseActions } from "@/components/segment/phases/phase-actions"; // Will create this

export default async function SegmentPhasesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const phasesRaw = await db.select({
      phase: bombingPhases,
      webhook: webhooks
  })
  .from(bombingPhases)
  .leftJoin(webhooks, eq(bombingPhases.webhookId, webhooks.id))
  .where(eq(bombingPhases.segmentId, id))
  .orderBy(asc(bombingPhases.releaseTime));

  const phases = phasesRaw.map(({ phase, webhook }) => ({
      ...phase,
      webhook: webhook
  }));

  const availableWebhooks = await db.select().from(webhooks).where(eq(webhooks.segmentId, id));
  const segmentTeams = await db.select().from(teams).where(eq(teams.segmentId, id));

  const now = new Date();

  const getStatus = (phase: typeof phases[0]) => {
      const pStart = phase.placementStartTime;
      const pEnd = phase.placementEndTime;
      const release = phase.releaseTime;

      if (!release) return "Configuring"; 

      if (now >= release || phase.isBombsReleased) return "Released";
      if (now >= pEnd) return "Closed";
      if (now >= pStart) return "Open";
      
      return "Scheduled";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bombing Phases</h1>
        <CreatePhaseDialog segmentId={id} webhooks={availableWebhooks} teams={segmentTeams} />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Phase Schedule</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Placement</TableHead>
                        <TableHead>Release</TableHead>
                        <TableHead>Webhook</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {phases.map((phase) => {
                        const status = getStatus(phase);
                        return (
                            <TableRow key={phase.id}>
                                <TableCell className="font-medium">{phase.name}</TableCell>
                                <TableCell>
                                    <div className="text-xs">
                                        <div>{phase.placementStartTime.toLocaleString()}</div>
                                        <div className="text-muted-foreground">to</div>
                                        <div>{phase.placementEndTime.toLocaleString()}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{phase.releaseTime ? phase.releaseTime.toLocaleString() : "-"}</TableCell>
                                <TableCell className="truncate max-w-[150px]">{phase.webhook ? phase.webhook.name : "-"}</TableCell>
                                <TableCell>
                                    <Badge variant={status === "Open" ? "default" : status === "Released" ? "secondary" : "outline"}>
                                        {status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <PhaseActions phase={phase} />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    {phases.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                No phases scheduled. Create one to start a bombing round.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
