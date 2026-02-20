
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { updateSegmentSettings } from "@/app/actions/segment-settings"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl';

const FormSchema = z.object({
  shipPlacementOpen: z.boolean(),
  bombingOpen: z.boolean(),
  isPublic: z.boolean(),
})

interface SettingsFormProps {
    segmentId: string;
    initialData: {
        shipPlacementOpen: boolean;
        bombingOpen: boolean;
        isPublic: boolean;
    }
}

export function SettingsForm({ segmentId, initialData }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Settings');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      shipPlacementOpen: initialData.shipPlacementOpen,
      bombingOpen: initialData.bombingOpen,
      isPublic: initialData.isPublic,
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    try {
        await updateSegmentSettings(segmentId, data);
        toast.success(t('saved'));
        router.refresh();
    } catch (error) {
        toast.error(t('error'));
    } finally {
        setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('controls')}</h3>
            
            <FormField
              control={form.control}
              name="shipPlacementOpen"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('shipPlacement')}</FormLabel>
                    <FormDescription>
                      {t('shipPlacementDesc')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bombingOpen"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('emergencyStop')}</FormLabel>
                    <FormDescription>
                      {t('emergencyStopDesc')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('visibility')}</h3>
             <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('visibility')}</FormLabel>
                    <FormDescription>
                      {t('visibilityDesc')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
        </div>

        <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('save')}
        </Button>
      </form>
    </Form>
  )
}
