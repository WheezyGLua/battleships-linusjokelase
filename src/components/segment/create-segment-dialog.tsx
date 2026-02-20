
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
import { createSegment } from "@/app/actions/segment"
import { useState } from "react"
import { useTranslations } from "next-intl"

export function CreateSegmentDialog() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('Segment');
  const tCommon = useTranslations('Common');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t('create')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={async (formData) => {
            await createSegment(formData);
            setOpen(false);
        }}>
          <DialogHeader>
            <DialogTitle>{t('createTitle')}</DialogTitle>
            <DialogDescription>
              {t('createDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {tCommon('name')}
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={t('namePlaceholder')}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {tCommon('description')}
              </Label>
              <Input
                id="description"
                name="description"
                defaultValue=""
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{t('createBtn')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
