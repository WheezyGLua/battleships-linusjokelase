
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
import { addManager } from "@/app/actions/segment-managers"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function AddManagerDialog({ segmentId }: { segmentId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Managers');
  const tCommon = useTranslations('Common');

  async function handleSubmit(formData: FormData) {
      setLoading(true);
      try {
        const result = await addManager(segmentId, formData);
        if (result.success) {
            toast.success(t('added'));
            setOpen(false);
        } else {
             toast.error(result.error || t('errorAdd'));
        }
      } catch (e) {
          toast.error(t('errorOccurred'));
      } finally {
        setLoading(false);
      }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t('add')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('addTitle')}</DialogTitle>
            <DialogDescription>
              {t('addDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{tCommon('email')}</Label>
              <Input id="email" name="email" type="email" placeholder="user@example.com" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('addAccess')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
