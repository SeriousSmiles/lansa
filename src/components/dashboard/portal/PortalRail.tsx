import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  ShieldCheck,
  Eye,
  Briefcase,
  BookOpen,
  Video,
  MessageCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Brain,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { useUnreadChatCount } from "@/hooks/useUnreadChatCount";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useDashboardPanel } from "./useDashboardPanel";
import lansaIcon from "@/assets/lansa-icon-brand.svg";

const RAIL_STATE_KEY = "lansa.portalRail.collapsed";

type Item = {
  label: string;
  icon: React.ElementType;
  href?: string;
  panel?: "profile" | "ai" | "insights" | "activity" | "inbox";
  badge?: number;
};

type Section = { label: string; items: Item[] };

interface PortalRailProps {
  unreadNotifications?: number;
}

export function PortalRail({ unreadNotifications = 0 }: PortalRailProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(RAIL_STATE_KEY) === "1";
  });
  const [profileImage, setProfileImage] = useState<string>("");
  const unreadChats = useUnreadChatCount();
  const { openPanel, view: panelView, open: panelOpen } = useDashboardPanel();

  useEffect(() => {
    localStorage.setItem(RAIL_STATE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("user_profiles")
        .select("profile_image")
        .eq("user_id", user.id)
        .maybeSingle();
      if (mounted && data?.profile_image) setProfileImage(data.profile_image);
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const sections: Section[] = [
    {
      label: "Workspace",
      items: [
        { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
        { label: "AI Coach", icon: Brain, panel: "ai" },
        { label: "Career Plan", icon: Sparkles, href: "/dashboard?focus=plan" },
      ],
    },
    {
      label: "Visibility",
      items: [
        { label: "Profile", icon: UserIcon, panel: "profile" },
        { label: "Certification", icon: ShieldCheck, href: "/certification" },
        { label: "Insights", icon: Eye, panel: "insights" },
      ],
    },
    {
      label: "Discover",
      items: [
        { label: "Jobs", icon: Briefcase, href: "/jobs" },
        { label: "Resources", icon: BookOpen, href: "/resources" },
        { label: "Content", icon: Video, href: "/content" },
      ],
    },
    {
      label: "Comms",
      items: [
        { label: "Messages", icon: MessageCircle, panel: "inbox", badge: unreadChats },
        { label: "Activity", icon: Bell, panel: "activity", badge: unreadNotifications },
      ],
    },
  ];

  const isActive = (item: Item) => {
    if (item.panel) return panelOpen && panelView === item.panel;
    if (!item.href) return false;
    const path = item.href.split("?")[0];
    return pathname === path;
  };

  const handleClick = (item: Item) => {
    if (item.panel) {
      openPanel(item.panel);
    } else if (item.href) {
      navigate(item.href);
    }
  };

  const displayName = user?.displayName?.trim() || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "hidden lg:flex sticky top-0 h-screen flex-col border-r border-border/40 bg-card/60 backdrop-blur-sm transition-[width] duration-300 ease-out shrink-0 z-30",
          collapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border/40">
          <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
            <img
              src={lansaIcon}
              alt="Lansa"
              className="h-7 w-7 shrink-0"
            />
            {!collapsed && (
              <span className="text-sm font-medium tracking-tight text-foreground truncate">
                Lansa
              </span>
            )}
          </Link>
        </div>

        {/* Sections */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-6">
          {sections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <div className="px-4 pb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
                  {section.label}
                </div>
              )}
              <ul className="space-y-1 px-2">
                {section.items.map((item) => {
                  const active = isActive(item);
                  const button = (
                    <button
                      type="button"
                      onClick={() => handleClick(item)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative group",
                        active
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                      )}
                      <item.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
                      {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                      {!collapsed && item.badge ? (
                        <span className="ml-auto rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 min-w-[18px] text-center">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      ) : null}
                      {collapsed && item.badge ? (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                      ) : null}
                    </button>
                  );
                  return (
                    <li key={item.label}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{button}</TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        button
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer: user + collapse */}
        <div className="border-t border-border/40 p-2 space-y-1">
          <button
            type="button"
            onClick={() => openPanel("profile")}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors",
              collapsed && "justify-center"
            )}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1 text-left">
                <div className="text-sm font-medium truncate">{displayName}</div>
                <div className="text-xs text-muted-foreground truncate">View profile</div>
              </div>
            )}
          </button>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className={cn(
                    "flex-1 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors",
                    collapsed && "justify-center"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Sign out</span>}
                </button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Sign out</TooltipContent>}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => !c)}
                  className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{collapsed ? "Expand" : "Collapse"}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}