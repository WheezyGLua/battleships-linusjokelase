
"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPhase } from "@/app/actions/segment-phases"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

type Webhook = {
    id: string;
    name: string;
    url: string;
}

type Team = {
    id: string;
    name: string;
}

export function CreatePhaseDialog({ segmentId, webhooks, teams }: { segmentId: string, webhooks: Webhook[], teams: Team[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Phases');
  const tCommon = useTranslations('Common');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t('add')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form action={async (formData) => {
            setLoading(true);
            await createPhase(segmentId, formData);
            setLoading(false);
            setOpen(false);
        }}>
          <DialogHeader>
            <DialogTitle>{t('createTitle')}</DialogTitle>
            <DialogDescription>
              {t('createDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('phaseName')}</Label>
              <Input id="name" name="name" placeholder={t('phaseNamePlaceholder')} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="placementStartTime">{t('placementStart')}</Label>
                  <Input id="placementStartTime" name="placementStartTime" type="datetime-local" required />
                  <p className="text-[10px] text-muted-foreground">{t('placementStartDesc')}</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="placementEndTime">{t('placementEnd')}</Label>
                  <Input id="placementEndTime" name="placementEndTime" type="datetime-local" required />
                  <p className="text-[10px] text-muted-foreground">{t('placementEndDesc')}</p>
                </div>
            </div>

             <div className="grid gap-2">
                  <Label htmlFor="releaseTime">{t('releaseTime')}</Label>
                  <Input id="releaseTime" name="releaseTime" type="datetime-local" className="w-[50%]" required />
                  <p className="text-[10px] text-muted-foreground">{t('releaseTimeDesc')}</p>
            </div>

            <div className="border-t pt-4 mt-2">
                <h4 className="text-sm font-medium mb-2">{t('teamLimitsTitle')}</h4>
                <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-1">
                    {teams.map(team => (
                        <div key={team.id} className="flex items-center space-x-2">
                            <Label className="w-[100px] truncate" title={team.name}>{team.name}</Label>
                            <Input 
                                type="number" 
                                name={`limit_${team.id}`} 
                                placeholder={t('limitPlaceholder')} 
                                className="h-8 w-16" 
                                min="0"
                            />
                        </div>
                    ))}
                </div>
                 <p className="text-[10px] text-muted-foreground">{t('teamLimitsDesc')}</p>
            </div>

            <div className="border-t pt-4 mt-2">
                <h4 className="text-sm font-medium mb-2">{t('automationTitle')}</h4>
                <div className="grid gap-2 mb-2">
                     <Label htmlFor="webhookId">{t('webhook')}</Label>
                     <Select name="webhookId">
                        <SelectTrigger>
                            <SelectValue placeholder={t('selectWebhook')} />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="none">{tCommon('none')}</SelectItem>
                             {webhooks.map(w => (
                                 <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                             ))}
                        </SelectContent>
                     </Select>
                </div>
                <div className="grid gap-2 mb-2">
                     <Label htmlFor="webhookMessage">{t('webhookMessage')}</Label>
                     <Textarea id="webhookMessage" name="webhookMessage" placeholder={t('webhookMessagePlaceholder')} />
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="webhookTime">{t('webhookTime')}</Label>
                  <Input id="webhookTime" name="webhookTime" type="datetime-local" />
                  <p className="text-[10px] text-muted-foreground">{t('webhookTimeDesc')}</p>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
