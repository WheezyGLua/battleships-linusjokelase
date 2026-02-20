
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface Team {
    id: string;
    name: string;
    type: "player" | "admin";
}

export function TeamNav({ 
    segmentId, 
    teams, 
    userId,
    shipPlacementOpen
}: { 
    segmentId: string; 
    teams: Team[]; 
    userId: string | null;
    shipPlacementOpen: boolean;
}) {
    const pathname = usePathname();
    const t = useTranslations('Game');
    const tCommon = useTranslations('Common');

    return (
        <div className="space-y-4">
             <div className="mb-4">
                 <Link href={`/dashboard/segment/${segmentId}`} className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center mb-2">
                    {tCommon('backToDashboard')}
                 </Link>
                 <h2 className="text-lg font-bold">{t('boardTitle')}</h2>
             </div>

             {shipPlacementOpen && (
                 <div className="mb-6">
                     <Button asChild variant="default" className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Link href={`/dashboard/segment/${segmentId}/game/setup`}>
                            {t('manageShips')}
                        </Link>
                     </Button>
                 </div>
             )}

             <div>
                 <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">{t('teams')}</h3>
                 <div className="space-y-1">
                     {teams.map(team => {
                         const isActive = pathname.includes(`/game/${team.id}`);
                         return (
                             <Button
                                key={team.id}
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn("w-full justify-start", team.type === 'admin' && "text-red-600 hover:text-red-700 hover:bg-red-50")}
                                asChild
                             >
                                 <Link href={`/dashboard/segment/${segmentId}/game/board/${team.id}`}>
                                     {team.name}
                                     {team.type === "admin" && <Badge variant="destructive" className="ml-auto text-[10px] h-5 px-1">Admin</Badge>}
                                 </Link>
                             </Button>
                         )
                     })}
                 </div>
             </div>
        </div>
    )
}
