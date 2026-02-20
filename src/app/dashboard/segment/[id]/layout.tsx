
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LayoutDashboard, Users, UserCog, Settings, LogOut, Swords, Ship, Timer, ShieldPlus } from 'lucide-react';
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { segmentMembers, segments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

import { getTranslations } from 'next-intl/server';

export default async function SegmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations('Dashboard');
  const tCommon = await getTranslations('Common');
  // Check if user is manager of this segment
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/signin");
  }

  // Verify membership
  const member = await db.query.segmentMembers.findFirst({
    where: and(
      eq(segmentMembers.segmentId, id),
      eq(segmentMembers.userId, session.user.id)
    ),
    with: {
        // We can't easily include segment here with Drizzle unless we defined relations in code
        // But we can query it separately or assume it exists if member exists
    }
  });

  if (!member) {
    redirect("/dashboard"); // Or 404
  }
  
  const segment = await db.query.segments.findFirst({
      where: eq(segments.id, id)
  });

  if (!segment) {
      notFound();
  }

  const isManager = member.role === "manager";

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64 bg-gray-100 p-4 dark:bg-zinc-900 border-r">
         <div className="mb-4">
             <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
               &larr; Back to Dashboard
             </Link>
             <h2 className="text-xl font-bold mt-2 truncate">{segment.name}</h2>
             <span className="text-xs uppercase bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono">
                 {member.role}
             </span>
         </div>
         
         <nav className="space-y-2">
            <Button asChild variant="ghost" className="w-full justify-start">
                <Link href={`/dashboard/segment/${id}`}>{t('overview')}</Link>
            </Button>
            
            <div className="pt-4 mt-4 border-t">
                 <p className="text-xs font-semibold text-muted-foreground mb-2">{t('gameAction')}</p>
                 {isManager && (
                    <>
                        <Button asChild variant="ghost" className="w-full justify-start">
                             <Link href={`/dashboard/segment/${id}/users`}>{tCommon('users')}</Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start">
                            <Link href={`/dashboard/segment/${id}/users/managers`}>{tCommon('managers')}</Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start">
                            <Link href={`/dashboard/segment/${id}/teams`}>{tCommon('teams')}</Link>
                        </Button>
                         <Button asChild variant="ghost" className="w-full justify-start">
                            <Link href={`/dashboard/segment/${id}/phases`}>{tCommon('phases')}</Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start">
                            <Link href={`/dashboard/segment/${id}/immunity`}>{tCommon('immunity')}</Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start">
                            <Link href={`/dashboard/segment/${id}/admin-chat`}>Admin Chat</Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start">
                            <Link href={`/dashboard/segment/${id}/settings`}>{tCommon('settings')}</Link>
                        </Button>
                    </>
                )}
                {!isManager && (
                   <Button asChild variant="ghost" className="w-full justify-start">
                        <Link href={`/dashboard/segment/${id}/teams`}>{tCommon('teams')}</Link>
                   </Button>
                )}
            </div>

            <div className="pt-4 mt-4 border-t">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{t('gameAction')}</p>
                 <Button asChild variant="ghost" className="w-full justify-start text-blue-600 dark:text-blue-400">
                    <Link href={`/dashboard/segment/${id}/game`}>{tCommon('openGameboard')}</Link>
                </Button>
            </div>
            
            <div className="pt-4 mt-auto space-y-2">
                <div className="flex gap-2">
                  <ModeToggle />
                  <LanguageSwitcher />
                </div>
            </div>
         </nav>
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        {children}
      </div>
    </div>
  );
}
