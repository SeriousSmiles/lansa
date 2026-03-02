import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { connectionRequestService } from "@/services/connectionRequestService";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface ConnectionRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientName: string;
  orgId?: string;
  onSuccess?: () => void;
}

export function ConnectionRequestModal({
  open,
  onOpenChange,
  recipientId,
  recipientName,
  orgId,
  onSuccess,
}: ConnectionRequestModalProps) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const MAX_CHARS = 200;

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      await connectionRequestService.sendRequest(
        recipientId,
        note.trim() || undefined,
        orgId
      );
      toast.success("Connection request sent!", {
        description: `${recipientName} will be notified and can choose to accept.`,
      });
      setNote("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        toast.info("Request already sent", {
          description: `You've already sent a request to ${recipientName}.`,
        });
        onOpenChange(false);
      } else {
        toast.error("Failed to send request", { description: err.message });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-[#F2713B]" />
            Connect with {recipientName}
          </DialogTitle>
          <DialogDescription>
            Add an optional note to introduce yourself. Once {recipientName} accepts, a private chat will open.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="relative">
            <Textarea
              value={note}
              onChange={e => {
                if (e.target.value.length <= MAX_CHARS) setNote(e.target.value);
              }}
              placeholder={`Tell ${recipientName} why you'd like to connect… (optional)`}
              rows={4}
              className="resize-none text-sm"
            />
            <div className={`absolute bottom-2 right-3 text-xs ${note.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}>
              {note.length}/{MAX_CHARS}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => { setNote(""); onOpenChange(false); }}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending}
              className="bg-[#F2713B] hover:bg-[#e05a28] text-white"
            >
              {sending ? "Sending…" : "Send Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
