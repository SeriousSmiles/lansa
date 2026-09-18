import { ReactNode } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AppWindow, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthProvider';
import { getRoleHomePath } from '@/utils/roleRoutes';

interface AdminTopBarProps {
  title: string;
  actions?: ReactNode;
}

export function AdminTopBar({ title, actions }: AdminTopBarProps) {
  const navigate = useNavigate();
  const { user, userType, isAdmin, signOut } = useUnifiedAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open account menu" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user?.email?.substring(0, 2).toUpperCase() || 'AD'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs font-normal text-muted-foreground truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate(getRoleHomePath({ userType, isAdmin }))}>
              <AppWindow className="mr-2 h-4 w-4" />
              Go to app
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
