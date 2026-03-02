import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal } from "lucide-react";

interface ChatInputProps {
  onSend: (body: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Write a message…" }: ChatInputProps) {
  const [value, setValue] = useState("");

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
    <div className="flex items-end gap-2">
      <Textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="resize-none min-h-[42px] max-h-32 flex-1 text-sm rounded-xl py-2.5 px-3"
        style={{ fieldSizing: "content" } as any}
      />
      <Button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        size="icon"
        className="h-[42px] w-[42px] rounded-xl flex-shrink-0 bg-[#F2713B] hover:bg-[#e05a28]"
        aria-label="Send message"
      >
        <SendHorizonal className="w-4 h-4" />
      </Button>
    </div>
  );
}
