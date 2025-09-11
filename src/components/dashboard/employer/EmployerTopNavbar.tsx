import { Link, useLocation } from "react-router-dom";
import { Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function EmployerTopNavbar() {
  const location = useLocation();
  
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
    }
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
                  <Icon className="h-4 w-4" />
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