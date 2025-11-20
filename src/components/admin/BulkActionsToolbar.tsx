import { Button } from '@/components/ui/button';
import { 
  Download, 
  Trash2, 
  UserCheck, 
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserColor, IntentStage } from '@/utils/adminColors';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onExportSelected: () => void;
  onAssignColor: (color: UserColor | null) => void;
  onAssignIntent: (intent: IntentStage) => void;
  onDeleteSelected: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onExportSelected,
  onAssignColor,
  onAssignIntent,
  onDeleteSelected,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <span className="font-medium">{selectedCount} selected</span>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportSelected}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <UserCheck className="h-4 w-4 mr-2" />
              Assign Color
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Admin Color Override</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAssignColor('purple')}>
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
              Purple (Advocate)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssignColor('green')}>
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              Green (Engaged)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssignColor('orange')}>
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
              Orange (Underused)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssignColor('red')}>
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
              Red (Drifting)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAssignColor(null)}>
              Clear Override
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Assign Intent
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Intent Stage</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAssignIntent('upgrade_ready')}>
              Upgrade Ready
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssignIntent('downgrade_risk')}>
              Downgrade Risk
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssignIntent('cancel_risk')}>
              Cancel Risk
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAssignIntent('none')}>
              Clear Intent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteSelected}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
      >
        <XCircle className="h-4 w-4 mr-2" />
        Clear
      </Button>
    </div>
  );
}
