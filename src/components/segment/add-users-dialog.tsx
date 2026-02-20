
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
import { Label } from "@/components/ui/label"
import { bulkCreateUsers } from "@/app/actions/segment-users"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

export function AddUsersDialog({ segmentId }: { segmentId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Users');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t('add')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form action={async (formData) => {
            setLoading(true);
            await bulkCreateUsers(segmentId, formData);
            setLoading(false);
            setOpen(false);
        }}>
          <DialogHeader>
            <DialogTitle>{t('addTitle')}</DialogTitle>
            <DialogDescription>
              {t('addDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <Label htmlFor="emails">{t('emails')}</Label>
             <textarea 
                id="emails" 
                name="emails" 
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={"user1@example.com\nuser2@example.com"}
                required
             />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('addBtn')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
