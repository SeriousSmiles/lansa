import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { CandidateFilters } from "@/services/candidateDiscoveryService";

interface FilterModalProps {
  filters: CandidateFilters;
  onApply: (filters: CandidateFilters) => void;
}

export function FilterModal({ filters, onApply }: FilterModalProps) {
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
  };

  const clearFilters = () => {
    setLocalFilters({});
  };

  return (
    <div className="space-y-6 p-4">
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
              onKeyPress={(e) => {
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
              {localFilters.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <Label className="text-sm font-medium">Experience Level</Label>
        <div className="mt-2 space-y-2">
          {['Entry Level', 'Mid Level', 'Senior Level', 'Executive'].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={level}
                checked={localFilters.experienceLevel === level}
                onCheckedChange={(checked) => {
                  setLocalFilters(prev => ({
                    ...prev,
                    experienceLevel: checked ? level : undefined
                  }));
                }}
              />
              <Label htmlFor={level} className="text-sm">{level}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <Label className="text-sm font-medium">Availability</Label>
        <div className="mt-2 space-y-2">
          {['Immediately', 'Within 2 weeks', 'Within 1 month', 'Flexible'].map((availability) => (
            <div key={availability} className="flex items-center space-x-2">
              <Checkbox
                id={availability}
                checked={localFilters.availability === availability}
                onCheckedChange={(checked) => {
                  setLocalFilters(prev => ({
                    ...prev,
                    availability: checked ? availability : undefined
                  }));
                }}
              />
              <Label htmlFor={availability} className="text-sm">{availability}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={clearFilters} className="flex-1">
          Clear All
        </Button>
        <Button onClick={handleApply} className="flex-1">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}