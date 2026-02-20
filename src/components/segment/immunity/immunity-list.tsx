
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { removeImmunity } from "@/app/actions/immunity"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ImmunityListProps {
    immunities: {
        id: string;
        teamName: string;
        startTime: Date;
        endTime: Date;
        message: string | null;
    }[]
}

export function ImmunityList({ immunities }: ImmunityListProps) {
  const t = useTranslations('Immunity');
  const router = useRouter();

  async function handleDelete(id: string) {
      try {
          await removeImmunity(id);
          toast.success(t('deleted'));
          router.refresh();
      } catch (e) {
          toast.error(t('errorDelete'));
      }
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('team')}</TableHead>
            <TableHead>{t('start')}</TableHead>
            <TableHead>{t('end')}</TableHead>
            <TableHead>{t('message')}</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {immunities.length === 0 ? (
             <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    {t('noImmunities')}
                </TableCell>
             </TableRow>
          ) : (
            immunities.map((item) => (
                <TableRow key={item.id}>
                <TableCell className="font-medium">{item.teamName}</TableCell>
                <TableCell>{format(new Date(item.startTime), "yyyy-MM-dd HH:mm")}</TableCell>
                <TableCell>{format(new Date(item.endTime), "yyyy-MM-dd HH:mm")}</TableCell>
                <TableCell>{item.message}</TableCell>
                <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </TableCell>
                </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
