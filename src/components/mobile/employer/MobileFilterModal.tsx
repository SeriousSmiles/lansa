import { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Filter } from "lucide-react";
import { CandidateFilters } from "@/services/candidateDiscoveryService";

interface FilterDrawerProps {
  filters: CandidateFilters;
  onApply: (filters: CandidateFilters) => void;
  children?: React.ReactNode;
}

export function FilterDrawer({ filters, onApply, children }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<CandidateFilters>(filters);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !localFilters.skills?.includes(newSkill.trim())) {
      setLocalFilters(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setLocalFilters(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill) || []
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    setOpen(false);
  };

  const clearFilters = () => {
    setLocalFilters({});
  };

  const activeFilterCount = [
    localFilters.location,
    localFilters.skills?.length,
    localFilters.experienceLevel,
    localFilters.availability,
    localFilters.lansaCertified,
  ].filter(Boolean).length;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="relative">
            <Filter className="h-5 w-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/30 my-3" />
        <div className="px-5 pb-8 overflow-y-auto">
          <h3 className="text-lg font-bold text-foreground mb-5">Filter Candidates</h3>

          <div className="space-y-6">
            {/* Certified only toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Certified Only</Label>
                <p className="text-xs text-muted-foreground">Show only Lansa-certified candidates</p>
              </div>
              <Switch
                checked={localFilters.lansaCertified !== false}
                onCheckedChange={(checked) =>
                  setLocalFilters(prev => ({ ...prev, lansaCertified: checked }))
                }
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-sm font-medium">Location</Label>
              <Input
                id="location"
                value={localFilters.location || ""}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. San Francisco, Remote"
                className="mt-2"
              />
            </div>

            {/* Skills */}
            <div>
              <Label className="text-sm font-medium">Skills</Label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button size="sm" onClick={addSkill} disabled={!newSkill.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {localFilters.skills && localFilters.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {localFilters.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Availability */}
            <div>
              <Label className="text-sm font-medium">Availability</Label>
              <div className="mt-2 space-y-2">
                {['Immediately', 'Within 2 weeks', 'Within 1 month', 'Flexible'].map((av) => (
                  <div key={av} className="flex items-center space-x-2">
                    <Checkbox
                      id={av}
                      checked={localFilters.availability === av}
                      onCheckedChange={(checked) =>
                        setLocalFilters(prev => ({ ...prev, availability: checked ? av : undefined }))
                      }
                    />
                    <Label htmlFor={av} className="text-sm">{av}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-6">
            <Button variant="outline" onClick={clearFilters} className="flex-1">
              Clear All
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// Keep legacy export for backward compatibility
export { FilterDrawer as FilterModal };
