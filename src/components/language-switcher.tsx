
"use client"

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();

  const onSelectChange = (nextLocale: string) => {
    startTransition(() => {
      // Set cookie
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    });
  };

  return (
      <Select defaultValue={locale} onValueChange={onSelectChange} disabled={isPending}>
        <SelectTrigger className="w-[140px]">
            <Globe className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="sv">Svenska</SelectItem>
            <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
  );
}
