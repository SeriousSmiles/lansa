import React from 'react';
import { useClerkAuth } from '@/contexts/ClerkAuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, ChevronDown, Plus } from 'lucide-react';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { useState } from 'react';

export function OrganizationSwitcher() {
  const { organization, organizations, switchOrganization } = useClerkAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="truncate">
                {organization?.name || 'Select Organization'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => switchOrganization(org.id)}
              className="cursor-pointer"
            >
              <Building2 className="h-4 w-4 mr-2" />
              <span>{org.name}</span>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowCreateDialog(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Create Organization</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}