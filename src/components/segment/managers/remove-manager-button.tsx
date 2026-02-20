
"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import { removeManager } from "@/app/actions/segment-managers"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function RemoveManagerButton({ managerId, segmentId }: { managerId: string, segmentId: string }) {
    const [loading, setLoading] = useState(false);
    const t = useTranslations('Managers');

    async function handleRemove() {
        if (!confirm(t('confirmRemove'))) return;
        setLoading(true);
        try {
            await removeManager(segmentId, managerId);
            toast.success(t('removed'));
        } catch {
            toast.error(t('errorRemove'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleRemove} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}
        </Button>
    )
}
