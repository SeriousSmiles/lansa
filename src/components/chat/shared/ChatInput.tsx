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
      "flex items-end gap-3 bg-white rounded-2xl px-4 py-3 border transition-colors duration-150",
      hasContent ? "border-border" : "border-border/40"
    )}>
      <Textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="resize-none min-h-[36px] max-h-28 flex-1 text-sm bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 leading-relaxed"
        style={{ fieldSizing: "content" } as any}
      />
      <Button
        onClick={handleSend}
        disabled={!hasContent || disabled}
        size="icon"
        className={cn(
          "h-10 w-10 rounded-xl flex-shrink-0 transition-all duration-200",
          hasContent
            ? "bg-[#F2713B] hover:bg-[#e05a28] text-white shadow-md scale-100"
            : "bg-[#EDE9E4] text-[#9E9087] scale-95 shadow-none"
        )}
        aria-label="Send message"
      >
        <SendHorizonal className="w-4 h-4" />
      </Button>
    </div>
  );
}
