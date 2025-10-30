/**
 * Phase 4: Quick Actions Widget
 * Floating action widget for quick access to common organization actions
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrgPermissions } from "@/hooks/useOrgPermissions";
import { 
  Plus, 
  UserPlus, 
  Settings, 
  Briefcase,
  ChevronUp,
  ChevronDown
} from "lucide-react";

export function QuickActionsWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { activeOrganization } = useOrganization();
  const { canInviteMembers, canCreateJobs, canManageOrgSettings } = useOrgPermissions();

  if (!activeOrganization) return null;

  const actions = [
    {
      label: "Invite Member",
      icon: UserPlus,
      onClick: () => navigate('/organization/settings?tab=invitations'),
      show: canInviteMembers,
    },
    {
      label: "Create Job",
      icon: Briefcase,
      onClick: () => navigate('/employer-dashboard'), // Will open job creator
      show: canCreateJobs,
    },
    {
      label: "Settings",
      icon: Settings,
      onClick: () => navigate('/organization/settings'),
      show: canManageOrgSettings,
      badge: 0, // TODO: Add pending requests count
    },
  ].filter(action => action.show);

  if (actions.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
      {isExpanded && (
        <Card className="mb-2 p-2 shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-1">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  action.onClick();
                  setIsExpanded(false);
                }}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
                {action.badge !== undefined && action.badge > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {action.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <Button
        size="lg"
        className="rounded-full h-14 w-14 shadow-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
