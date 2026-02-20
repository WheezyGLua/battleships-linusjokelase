
import { db } from "@/db";
import { segmentMembers, users } from "@/db/schema"; // Assuming users table logic or we fetch from auth?
// segmentMembers has userId. User names logic is tricky if using BetterAuth directly.
// We can fetch from BetterAuth API or if we have a users table synced? 
// Schema says: "Foreign keys to 'user' table are logical only".
// So we need to fetch user details. 
// "User Management: Managers will 'create' users." -> "users" table.
// Wait, `auth-schema.ts` has `user`.
// Let's assume we can join or fetch.
// Actually, `segmentMembers` has `userId`.
import { eq, and } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth"; // If we can fetch user info
import { AddManagerDialog } from "@/components/segment/managers/add-manager-dialog";
import { RemoveManagerButton } from "@/components/segment/managers/remove-manager-button";
import { user as userSchema } from "@/db/auth-schema"; // Use the read-only schema

export default async function SegmentManagersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch Managers
  // We need to join with `user` table to get names/emails.
  // Drizzle `db.select().from(segmentMembers).innerJoin(userSchema, ...)`
  
  const managers = await db.select({
      id: segmentMembers.id,
      userId: segmentMembers.userId,
      name: userSchema.name,
      email: userSchema.email,
      joinedAt: segmentMembers.joinedAt
  })
  .from(segmentMembers)
  .innerJoin(userSchema, eq(segmentMembers.userId, userSchema.id))
  .where(and(
      eq(segmentMembers.segmentId, id),
      eq(segmentMembers.role, "manager")
  ));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Managers</h1>
        <AddManagerDialog segmentId={id} />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Existing Managers</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {managers.map((manager) => (
                        <TableRow key={manager.id}>
                            <TableCell className="font-medium">{manager.name}</TableCell>
                            <TableCell>{manager.email}</TableCell>
                            <TableCell>{manager.joinedAt.toLocaleDateString()}</TableCell>
                            <TableCell>
                                <RemoveManagerButton managerId={manager.id} segmentId={id} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
