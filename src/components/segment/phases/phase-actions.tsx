"use client"

import { Button } from "@/components/ui/button"
import { MoreHorizontal, Copy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { duplicatePhase, setPhaseStatus } from "@/app/actions/segment-phases" 
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

export function PhaseActions({ phase }: { phase: any }) {
    const [loading, setLoading] = useState(false);
    const t = useTranslations('Phases');

    const handleDuplicate = async () => {
        setLoading(true);
        try {
            await duplicatePhase(phase.id);
            toast.success(t('duplicated'));
        } catch (error) {
            toast.error(t('errorDuplicate'));
        } finally {
            setLoading(false);
        }
    }

    const handleStatusChange = async (action: 'open' | 'close' | 'release') => {
        setLoading(true);
        try {
            await setPhaseStatus(phase.id, action);
            if (action === 'open') toast.success(t('opened'));
            else if (action === 'close') toast.success(t('closed'));
            else toast.success(t('released'));
        } catch (error) {
            toast.error(t('errorTrigger'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t('actionsLabel')}</span>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('actionsLabel')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="mr-2 h-4 w-4" /> {t('duplicate')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('triggersLabel')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStatusChange('open')}>
                    {t('openPlacement')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('close')}>
                    {t('closePlacement')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('release')}>
                    {t('releaseBombs')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
