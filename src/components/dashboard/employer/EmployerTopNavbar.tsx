import { Link, useLocation } from "react-router-dom";
import { Building2, Users, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useUnreadChatCount } from "@/hooks/useUnreadChatCount";

export function EmployerTopNavbar() {
  const location = useLocation();
  const unreadCount = useUnreadChatCount();
  
  const navItems = [
    {
      title: "Dashboard",
      href: "/employer-dashboard",
      icon: Building2,
    },
    {
      title: "Browse Candidates",
      href: "/browse-candidates",
      icon: Users,
    },
    {
      title: "Messages",
      href: "/chat",
      icon: Mail,
      badge: unreadCount,
    },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Lansa for Business</span>
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-muted hover:text-foreground",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <div className="relative">
                    <Icon className="h-4 w-4" />
                    {'badge' in item && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}