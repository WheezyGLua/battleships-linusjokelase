'use server'

import { db } from "@/db";
import { adminChatMessages, webhooks, segmentMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function sendAdminMessage(segmentId: string, content: string, webhookId?: string) {
    const session = await auth.api.getSession({
         headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

    // Verify Manager
    const membership = await db.query.segmentMembers.findFirst({
        where: and(
            eq(segmentMembers.segmentId, segmentId),
            eq(segmentMembers.userId, session.user.id),
            eq(segmentMembers.role, "manager")
        )
    });
    
    if (!membership) throw new Error("Must be a manager");

    // Insert message
    await db.insert(adminChatMessages).values({
        segmentId,
        userId: session.user.id,
        content,
        webhookId: webhookId && webhookId !== "none" ? webhookId : null,
    });

    // Fire Webhook if selected
    if (webhookId && webhookId !== "none") {
        const webhook = await db.query.webhooks.findFirst({
            where: eq(webhooks.id, webhookId)
        });

        if (webhook && webhook.url) {
            try {
                await fetch(webhook.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: content }) // Google Chat / Discord format
                    // Note: Discord uses 'content', Google Chat uses 'text'. 
                    // I'll try to support both or generic.
                    // If Google Chat, structure might be { text: "..." }
                    // If Discord, structure is { content: "..." }
                    // I will send both keys for max compatibility or check URL structure?
                    // Better: Send universal payload or just 'text' for Google Chat as per user context?
                    // User mentioned "Google Chat webhooks".
                    // Google Chat payload: { "text": "Hello" }
                });
            } catch (e) {
                console.error("Failed to fire webhook", e);
            }
        }
    }

    revalidatePath(`/dashboard/segment/${segmentId}/admin-chat`);
}
