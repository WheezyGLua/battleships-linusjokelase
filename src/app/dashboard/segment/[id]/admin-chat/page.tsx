import { db } from "@/db";
import { adminChatMessages, webhooks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ChatInterface } from "@/components/segment/admin-chat/chat-interface";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function AdminChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch Webhooks
  const availableWebhooks = await db.select().from(webhooks).where(eq(webhooks.segmentId, id));

  // Fetch Messages
  const messages = await db.select().from(adminChatMessages)
    .where(eq(adminChatMessages.segmentId, id))
    .orderBy(desc(adminChatMessages.sentAt))
    .limit(50); // Limit to last 50 for now

  return (
    <div className="space-y-6">
       <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
            <CardTitle className="text-3xl font-bold">Admin Chat</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
            <ChatInterface segmentId={id} webhooks={availableWebhooks} messages={messages} />
        </CardContent>
      </Card>
    </div>
  );
}
