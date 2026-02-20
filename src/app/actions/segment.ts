
'use server'

import { db } from "@/db";
import { segments, segmentMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function createSegment(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    throw new Error("Name is required");
  }

  // Create Segment
  const segmentId = crypto.randomUUID();
  await db.insert(segments).values({
    id: segmentId,
    name,
    description,
    shipPlacementOpen: false,
    bombingOpen: false,
    isPublic: false,
  });

  // Add Creator as Manager
  await db.insert(segmentMembers).values({
    segmentId: segmentId,
    userId: session.user.id,
    role: "manager",
  });

  redirect(`/dashboard/segment/${segmentId}`);
}
