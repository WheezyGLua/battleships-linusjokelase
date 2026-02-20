"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createWebhook, deleteWebhook, updateWebhook } from "@/app/actions/webhooks";
import { Loader2, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type Webhook = {
  id: string;
  name: string;
  url: string;
  segmentId: string;
  createdAt: string;
  updatedAt: string;
};

export function WebhookList({ segmentId, webhooks }: { segmentId: string, webhooks: Webhook[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Settings');
  const tCommon = useTranslations('Common');

  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const handleCreate = async () => {
    if (!newName || !newUrl) return toast.error(t('webhookRequiredFields'));
    setLoading(true);
    try {
      await createWebhook(segmentId, newName, newUrl);
      toast.success(t('webhookCreated'));
      setIsCreating(false);
      setNewName("");
      setNewUrl("");
    } catch (error) {
      toast.error(t('webhookError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('webhookConfirmDelete'))) return;
    setLoading(true);
    try {
      await deleteWebhook(id, segmentId);
      toast.success(t('webhookDeleted'));
    } catch (error) {
      toast.error(t('webhookErrorDelete'));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (webhook: Webhook) => {
    setEditingId(webhook.id);
    setEditName(webhook.name);
    setEditUrl(webhook.url);
  };

  const handleUpdate = async () => {
    if (!editingId || !editName || !editUrl) return;
    setLoading(true);
    try {
      await updateWebhook(editingId, segmentId, editName, editUrl);
      toast.success(t('webhookUpdated'));
      setEditingId(null);
    } catch (error) {
      toast.error(t('webhookErrorUpdate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('webhooks')}</CardTitle>
          <CardDescription>{t('webhooksDesc')}</CardDescription>
        </div>
        <Button onClick={() => setIsCreating(true)} size="sm" disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" /> {t('webhookAdd')}
        </Button>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <div className="mb-4 p-4 border rounded-md space-y-4 bg-muted/20">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('webhookName')}</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. General Channel" />
              </div>
              <div className="space-y-2">
                <Label>{t('webhookUrl')}</Label>
                <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://chat.googleapis.com/..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>{t('webhookCancel')}</Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('webhookSave')}
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tCommon('name')}</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-[100px]">{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.length === 0 && !isCreating && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  {t('webhookNone')}
                </TableCell>
              </TableRow>
            )}
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell>
                  {editingId === webhook.id ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  ) : (
                    webhook.name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === webhook.id ? (
                    <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
                  ) : (
                    <div className="truncate max-w-[300px]" title={webhook.url}>{webhook.url}</div>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === webhook.id ? (
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={handleUpdate} disabled={loading}>
                        <Save className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(webhook)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(webhook.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
