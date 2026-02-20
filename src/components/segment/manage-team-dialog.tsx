
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
import { useState } from "react"
import { toast } from "sonner"
import { updateTeamBombs } from "@/app/actions/segment-teams"
import { Loader2, Settings2 } from "lucide-react"
import { useTranslations } from "next-intl"

export function ManageTeamDialog({ team }: { team: any }) {
  const [open, setOpen] = useState(false)
  const [bombs, setBombs] = useState(team.bombsAvailable)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('Teams');

  async function handleSave() {
    setLoading(true)
    try {
        await updateTeamBombs(team.id, parseInt(bombs.toString()));
        toast.success(t('updated'));
        setOpen(false);
    } catch (e) {
        toast.error(t('errorUpdate'));
    } finally {
        setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
            <Settings2 className="w-4 h-4 mr-2" />
            {t('manage')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('manage')} — {team.name}</DialogTitle>
          <DialogDescription>
            {t('manageDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bombs" className="text-right">
              {t('bombs')}
            </Label>
            <Input
              id="bombs"
              type="number"
              value={bombs}
              onChange={(e) => setBombs(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
