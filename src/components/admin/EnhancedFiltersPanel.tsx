import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface FilterOptions {
  search: string;
  colorFilter: string;
  userType: string;
  certifiedFilter: string;
  onboardingFilter: string;
  intentFilter: string;
  visibilityFilter: string;
  dateRange: 'all' | '7days' | '30days' | '90days';
}

interface EnhancedFiltersPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

export function EnhancedFiltersPanel({
  filters,
  onFiltersChange,
  onClearFilters,
}: EnhancedFiltersPanelProps) {
  const [open, setOpen] = useState(false);

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value !== '';
    if (key === 'dateRange') return value !== 'all';
    return value !== 'all';
  }).length;

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter Users</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearFilters();
                    setOpen(false);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Color Segment</Label>
                <Select
                  value={filters.colorFilter}
                  onValueChange={(value) => updateFilter('colorFilter', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All colors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colors</SelectItem>
                    <SelectItem value="purple">Purple (Advocate)</SelectItem>
                    <SelectItem value="green">Green (Engaged)</SelectItem>
                    <SelectItem value="orange">Orange (Underused)</SelectItem>
                    <SelectItem value="red">Red (Drifting)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>User Type</Label>
                <Select
                  value={filters.userType}
                  onValueChange={(value) => updateFilter('userType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="job_seeker">Job Seeker</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                    <SelectItem value="visionary">Visionary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Certification Status</Label>
                <Select
                  value={filters.certifiedFilter}
                  onValueChange={(value) => updateFilter('certifiedFilter', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="certified">Certified Only</SelectItem>
                    <SelectItem value="not_certified">Not Certified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Onboarding Status</Label>
                <Select
                  value={filters.onboardingFilter}
                  onValueChange={(value) => updateFilter('onboardingFilter', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Intent Stage</Label>
                <Select
                  value={filters.intentFilter}
                  onValueChange={(value) => updateFilter('intentFilter', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="upgrade_ready">Upgrade Ready</SelectItem>
                    <SelectItem value="downgrade_risk">Downgrade Risk</SelectItem>
                    <SelectItem value="cancel_risk">Cancel Risk</SelectItem>
                    <SelectItem value="none">No Intent Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={filters.visibilityFilter}
                  onValueChange={(value) => updateFilter('visibilityFilter', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="visible">Visible to Employers</SelectItem>
                    <SelectItem value="hidden">Hidden from Employers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Last Active</Label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => updateFilter('dateRange', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
