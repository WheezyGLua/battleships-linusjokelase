
import { db } from "@/db";
import { segmentMembers } from "@/db/schema";
import { user as userTable } from "@/db/auth-schema"; 
import { eq, and } from "drizzle-orm";
import { AddUsersDialog } from "@/components/segment/add-users-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function SegmentUsersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Fetch users in this segment
  const members = await db.select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      role: segmentMembers.role,
      joinedAt: segmentMembers.joinedAt
  })
  .from(segmentMembers)
  .innerJoin(userTable, eq(segmentMembers.userId, userTable.id)) // User table from auth-schema
  .where(eq(segmentMembers.segmentId, id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        <AddUsersDialog segmentId={id} />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Member List</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((m) => (
                        <TableRow key={m.id}>
                            <TableCell>{m.name}</TableCell>
                            <TableCell>{m.email}</TableCell>
                            <TableCell className="uppercase text-xs font-mono">{m.role}</TableCell>
                            <TableCell>{m.joinedAt.toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
