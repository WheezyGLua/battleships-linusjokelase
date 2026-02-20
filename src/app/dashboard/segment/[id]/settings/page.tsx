
import { db } from "@/db";
import { segments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsForm } from "@/components/segment/settings-form";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { WebhookList } from "@/components/segment/settings/webhook-list";
import { getWebhooks } from "@/app/actions/webhooks";

export default async function SegmentSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const segment = await db.query.segments.findFirst({
      where: eq(segments.id, id)
  });

  if (!segment) return <div>Segment not found</div>;

  const rawWebhooks = await getWebhooks(id);
  const webhooks = rawWebhooks.map(w => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Game Settings</h1>

      <Card>
          <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Manage game phases and visibility.</CardDescription>
          </CardHeader>
          <CardContent>
              <SettingsForm 
                segmentId={id} 
                initialData={{
                    shipPlacementOpen: segment.shipPlacementOpen,
                    bombingOpen: segment.bombingOpen,
                    isPublic: segment.isPublic,
                }}
              />
          </CardContent>
      </Card>

      <WebhookList segmentId={id} webhooks={webhooks} />
    </div>
  );
}
