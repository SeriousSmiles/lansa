/**
 * Icon Picker Component
 * Allows admin to select an icon for product updates
 */

import { useState } from 'react';
import { Rocket, Sparkles, Bug, Megaphone, Zap, Star, Gift, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

export const AVAILABLE_ICONS = {
  rocket: { icon: Rocket, label: 'Rocket' },
  sparkles: { icon: Sparkles, label: 'Sparkles' },
  bug: { icon: Bug, label: 'Bug' },
  megaphone: { icon: Megaphone, label: 'Megaphone' },
  zap: { icon: Zap, label: 'Zap' },
  star: { icon: Star, label: 'Star' },
  gift: { icon: Gift, label: 'Gift' },
  bell: { icon: Bell, label: 'Bell' },
  checkCircle: { icon: CheckCircle, label: 'Check Circle' },
  alertCircle: { icon: AlertCircle, label: 'Alert Circle' },
};

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);

  const SelectedIcon = value && AVAILABLE_ICONS[value as keyof typeof AVAILABLE_ICONS]
    ? AVAILABLE_ICONS[value as keyof typeof AVAILABLE_ICONS].icon
    : Rocket;

  const selectedLabel = value && AVAILABLE_ICONS[value as keyof typeof AVAILABLE_ICONS]
    ? AVAILABLE_ICONS[value as keyof typeof AVAILABLE_ICONS].label
    : 'Select Icon';

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <SelectedIcon className="h-4 w-4 mr-2" />
          {selectedLabel}
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Content
        className={cn(
          'z-[9999] w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        )}
        sideOffset={4}
      >
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(AVAILABLE_ICONS).map(([key, { icon: Icon, label }]) => (
            <button
              key={key}
              type="button"
              className={cn(
                'flex flex-col items-center p-2 rounded-md text-sm transition-colors cursor-pointer',
                value === key
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1 leading-none">{label}</span>
            </button>
          ))}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  );
}
