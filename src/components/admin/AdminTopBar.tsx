import { ReactNode } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface AdminTopBarProps {
  title: string;
  actions?: ReactNode;
}

export function AdminTopBar({ title, actions }: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
