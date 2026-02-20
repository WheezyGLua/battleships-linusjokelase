
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { segmentMembers, segments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CreateSegmentDialog } from "@/components/segment/create-segment-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/signin");
  }

  // Fetch user modules/segments
  const userSegments = await db.select({
      id: segments.id,
      name: segments.name,
      role: segmentMembers.role
  })
  .from(segmentMembers)
  .innerJoin(segments, eq(segmentMembers.segmentId, segments.id))
  .where(eq(segmentMembers.userId, session.user.id));

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <CreateSegmentDialog />
      </div>

      {userSegments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Segments Found</CardTitle>
            <CardDescription>You are not part of any segments yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create a segment using the button above to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userSegments.map((seg) => (
            <Card key={seg.id}>
              <CardHeader>
                <CardTitle>{seg.name}</CardTitle>
                <CardDescription>Role: {seg.role}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button asChild variant="outline">
                  <Link href={`/dashboard/segment/${seg.id}`}>
                    Manage
                  </Link>
                </Button>
                {/* If role is manager, maybe show different options? */}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
