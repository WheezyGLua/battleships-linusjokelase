"use server";

import { db } from "@/db";
import { webhooks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth"; // Assuming auth setup
import { headers } from "next/headers";

export async function getWebhooks(segmentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Unauthorized");

  // TODO: Add segment permission check here if strict security needed

  return await db.select().from(webhooks).where(eq(webhooks.segmentId, segmentId));
}

export async function createWebhook(segmentId: string, name: string, url: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Unauthorized");

  await db.insert(webhooks).values({
    segmentId,
    name,
    url,
  });

  revalidatePath(`/dashboard/segment/${segmentId}/settings`);
  // Or wherever the settings page is
}

export async function deleteWebhook(id: string, segmentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Unauthorized");

  await db.delete(webhooks).where(and(eq(webhooks.id, id), eq(webhooks.segmentId, segmentId)));

  revalidatePath(`/dashboard/segment/${segmentId}/settings`);
}

export async function updateWebhook(id: string, segmentId: string, name: string, url: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Unauthorized");

  await db.update(webhooks)
    .set({ name, url })
    .where(and(eq(webhooks.id, id), eq(webhooks.segmentId, segmentId)));

  revalidatePath(`/dashboard/segment/${segmentId}/settings`);
}
