/**
 * Phase 4: Quick Actions Widget
 * Floating action widget for quick access to common organization actions
 * Redesigned with Lansa branding, icons, and clear purpose
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrgPermissions } from "@/hooks/useOrgPermissions";
import { 
  UserPlus, 
  Settings, 
  Briefcase,
  X,
  Zap,
  Sparkles
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function QuickActionsWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { activeOrganization } = useOrganization();
  const { canInviteMembers, canCreateJobs, canManageOrgSettings } = useOrgPermissions();

  if (!activeOrganization) return null;

  const actions = [
    {
      label: "Invite Team Member",
      description: "Add colleagues to your organization",
      icon: UserPlus,
      onClick: () => navigate('/organization/settings?tab=invitations'),
      show: canInviteMembers,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 hover:bg-emerald-100",
    },
    {
      label: "Post New Job",
      description: "Create a job listing to find talent",
      icon: Briefcase,
      onClick: () => navigate('/employer-dashboard'),
      show: canCreateJobs,
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
    },
    {
      label: "Organization Settings",
      description: "Manage your organization details",
      icon: Settings,
      onClick: () => navigate('/organization/settings'),
      show: canManageOrgSettings,
      color: "text-slate-600",
      bgColor: "bg-slate-50 hover:bg-slate-100",
    },
  ].filter(action => action.show);

  if (actions.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Expanded Menu */}
        {isExpanded && (
          <Card className="mb-3 p-3 shadow-xl border-border/50 animate-in fade-in slide-in-from-bottom-3 duration-200 min-w-[260px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Quick Actions</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsExpanded(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-full justify-start h-auto py-3 px-3 ${action.bgColor} transition-colors`}
                  onClick={() => {
                    action.onClick();
                    setIsExpanded(false);
                  }}
                >
                  <action.icon className={`h-5 w-5 mr-3 ${action.color}`} />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                    <span className="text-xs text-muted-foreground">{action.description}</span>
                  </div>
                </Button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 pt-2 border-t text-center">
              Quick access to common employer actions
            </p>
          </Card>
        )}

        {/* Main FAB Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className={`rounded-full h-14 w-14 shadow-lg transition-all duration-200 ${
                isExpanded 
                  ? 'bg-muted hover:bg-muted/80 text-muted-foreground rotate-45' 
                  : 'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground'
              }`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <X className="h-6 w-6 transition-transform" />
              ) : (
                <Zap className="h-6 w-6" />
              )}
            </Button>
          </TooltipTrigger>
          {!isExpanded && (
            <TooltipContent side="left" className="bg-foreground text-background">
              <p>Quick Actions</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
