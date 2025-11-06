import { useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Admin Dashboard',
  '/admin/users': 'Users',
  '/admin/organizations': 'Organizations',
  '/admin/updates': 'Product Updates',
  '/admin/pricing': 'Pricing Wall',
  '/admin/trends': 'Trends',
  '/admin/analytics': 'Analytics',
  '/admin/historical': 'Historical Data',
  '/admin/documents': 'Documents',
  '/admin/support': 'Support',
  '/admin/settings': 'Settings',
};

export function AdminMobileHeader() {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50 md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Lansa
          </div>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm font-semibold truncate">{pageTitle}</h1>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.email?.substring(0, 2).toUpperCase() || 'AD'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
