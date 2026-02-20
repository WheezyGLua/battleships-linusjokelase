
import { db } from "@/db";
import { segments, teams, segmentMembers } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SegmentOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const segment = await db.query.segments.findFirst({
      where: eq(segments.id, id)
  });
  
  // Stats
  const teamCount = await db.select({ count: count() }).from(teams).where(eq(teams.segmentId, id));
  const userCount = await db.select({ count: count() }).from(segmentMembers).where(eq(segmentMembers.segmentId, id));

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Overview</h1>
        
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{userCount[0].count}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{teamCount[0].count}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {segment?.shipPlacementOpen ? "Placement Open" : "Placement Closed"}
                    </div>
                     <p className="text-xs text-muted-foreground">
                        Bombing: {segment?.bombingOpen ? "Open" : "Closed"}
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
