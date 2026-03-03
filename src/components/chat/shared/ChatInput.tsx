import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (body: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Write a message…" }: ChatInputProps) {
  const [value, setValue] = useState("");
  const hasContent = value.trim().length > 0;

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn(
      "flex items-end gap-2.5 bg-white rounded-2xl px-3 py-2 border transition-colors duration-150",
      hasContent ? "border-border" : "border-border/40"
    )}>
      <Textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="resize-none min-h-[32px] max-h-28 flex-1 text-sm bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
        style={{ fieldSizing: "content" } as any}
      />
      <Button
        onClick={handleSend}
        disabled={!hasContent || disabled}
        size="icon"
        className={cn(
          "h-9 w-9 rounded-xl flex-shrink-0 transition-all duration-200 shadow-sm",
          hasContent
            ? "bg-[#F2713B] hover:bg-[#e05a28] scale-100"
            : "bg-muted text-muted-foreground scale-90"
        )}
        aria-label="Send message"
      >
        <SendHorizonal className="w-4 h-4" />
      </Button>
    </div>
  );
}
