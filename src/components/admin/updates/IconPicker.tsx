/**
 * Icon Picker Component
 * Allows admin to select an icon for product updates
 */

import { useState } from 'react';
import { Rocket, Sparkles, Bug, Megaphone, Zap, Star, Gift, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <SelectedIcon className="h-4 w-4 mr-2" />
          {value && AVAILABLE_ICONS[value as keyof typeof AVAILABLE_ICONS]
            ? AVAILABLE_ICONS[value as keyof typeof AVAILABLE_ICONS].label
            : 'Select Icon'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(AVAILABLE_ICONS).map(([key, { icon: Icon, label }]) => (
            <Button
              key={key}
              variant={value === key ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col items-center p-2 h-auto"
              onClick={() => { onChange(key); setOpen(false); }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{label}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
