/**
 * Organization Switcher Component
 * Allows users to switch between organizations they belong to
 */

import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganization } from "@/contexts/OrganizationContext";
import { cn } from "@/lib/utils";

export function OrganizationSwitcher() {
  const { activeOrganization, organizations, switchOrganization } = useOrganization();

  // Don't show if user only has one organization
  if (organizations.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{activeOrganization?.name || "Select organization"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((membership) => (
          <DropdownMenuItem
            key={membership.organization_id}
            onClick={() => switchOrganization(membership.organization_id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Check
              className={cn(
                "h-4 w-4",
                activeOrganization?.id === membership.organization_id
                  ? "opacity-100"
                  : "opacity-0"
              )}
            />
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="truncate">{membership.organization?.name}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {membership.role}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
