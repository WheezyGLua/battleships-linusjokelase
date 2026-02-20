
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createTeam } from "@/app/actions/segment-teams"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

interface CreateTeamDialogProps {
  segmentId: string;
  users: { id: string; name: string }[];
}

export function CreateTeamDialog({ segmentId, users }: CreateTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("player");
  const t = useTranslations('Teams');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t('create')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={async (formData) => {
            setLoading(true);
            await createTeam(segmentId, formData);
            setLoading(false);
            setOpen(false);
        }}>
          <DialogHeader>
            <DialogTitle>{t('create')}</DialogTitle>
            <DialogDescription>
              {t('createDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">{t('name')}</Label>
              <Input id="name" name="name" placeholder={t('placeholderName')} required />
            </div>

             <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="type">{t('type')}</Label>
               <Select name="type" defaultValue="player" onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">{t('typePlayer')}</SelectItem>
                  <SelectItem value="admin">{t('typeAdmin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="captainId">{t('captainOptional')}</Label>
               <Select name="captainId">
                <SelectTrigger>
                  <SelectValue placeholder={t('selectCaptain')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
