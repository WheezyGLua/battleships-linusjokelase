"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sendAdminMessage } from "@/app/actions/admin-chat"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

type Webhook = {
    id: string;
    name: string;
}

export function ChatInterface({ segmentId, webhooks, messages }: { segmentId: string, webhooks: Webhook[], messages: any[] }) {
    const [content, setContent] = useState("");
    const [webhookId, setWebhookId] = useState<string>("none");
    const [loading, setLoading] = useState(false);
    const t = useTranslations('AdminChat');

    const handleSend = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            await sendAdminMessage(segmentId, content, webhookId);
            setContent("");
            toast.success(t('sent'));
        } catch (e) {
            toast.error(t('errorSend'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            <div className="lg:col-span-2 flex flex-col border rounded-md h-full">
                <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col-reverse">
                    {messages.length === 0 && <p className="text-center text-muted-foreground mt-10">{t('noMessages')}</p>}
                    {messages.map((msg) => (
                        <div key={msg.id} className="flex flex-col border p-3 rounded-lg bg-muted/20">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-sm">Admin</span>
                                <span className="text-xs text-muted-foreground">{new Date(msg.sentAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            {msg.webhookId && (
                                <div className="mt-2 text-[10px] text-muted-foreground flex items-center">
                                    <span className="bg-primary/10 px-1 rounded">{t('sentVia')} {webhooks.find(w => w.id === msg.webhookId)?.name || t('unknownWebhook')}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t bg-background">
                     <div className="grid gap-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Select value={webhookId} onValueChange={setWebhookId}>
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue placeholder={t('selectWebhook')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">{t('noWebhook')}</SelectItem>
                                    {webhooks.map(w => (
                                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-xs text-muted-foreground">{t('webhookHint')}</span>
                        </div>
                        <div className="flex gap-2">
                            <Textarea 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)} 
                                placeholder={t('placeholder')}
                                className="min-h-[80px]"
                            />
                            <Button className="h-auto" onClick={handleSend} disabled={loading || !content.trim()}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                     </div>
                </div>
            </div>
            
            <div className="border rounded-md p-4 h-full overflow-y-auto hidden lg:block">
                <h3 className="font-semibold mb-4">{t('infoTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('infoDesc')}</p>
                <div className="mt-4">
                    <h4 className="text-sm font-medium">{t('availableWebhooks')}</h4>
                    <ul className="mt-2 space-y-1">
                        {webhooks.map(w => (
                            <li key={w.id} className="text-xs bg-muted p-1 rounded px-2">{w.name}</li>
                        ))}
                        {webhooks.length === 0 && <li className="text-xs text-muted-foreground">{t('noWebhooks')}</li>}
                    </ul>
                </div>
            </div>
        </div>
    )
}
