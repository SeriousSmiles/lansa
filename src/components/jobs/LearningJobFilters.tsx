import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LearningFeedFilters } from "@/services/learningJobFeedService";
import { X } from "lucide-react";

interface LearningJobFiltersProps {
  filters: LearningFeedFilters;
  onFilterChange: (filters: Partial<LearningFeedFilters>) => void;
}

const CATEGORIES = [
  "Technology",
  "Marketing",
  "Design",
  "Sales",
  "Engineering",
  "Operations",
  "Finance",
  "Creative",
  "Hospitality",
];

const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export function LearningJobFilters({ filters, onFilterChange }: LearningJobFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  const handleCategoryToggle = (category: string) => {
    const categories = filters.categories || [];
    const newCategories = categories.includes(category)
      ? categories.filter((c) => c !== category)
      : [...categories, category];
    onFilterChange({ categories: newCategories });
  };

  const handleJobTypeToggle = (jobType: string) => {
    const jobTypes = filters.job_types || [];
    const newJobTypes = jobTypes.includes(jobType)
      ? jobTypes.filter((t) => t !== jobType)
      : [...jobTypes, jobType];
    onFilterChange({ job_types: newJobTypes });
  };

  const handleSearchSubmit = () => {
    onFilterChange({ search: localSearch });
  };

  const clearFilters = () => {
    setLocalSearch("");
    onFilterChange({
      categories: [],
      job_types: [],
      remote_only: false,
      search: "",
    });
  };

  const hasActiveFilters =
    (filters.categories?.length || 0) > 0 ||
    (filters.job_types?.length || 0) > 0 ||
    filters.remote_only ||
    (filters.search?.length || 0) > 0;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="w-3 h-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <Label>Search</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Search jobs..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit();
              }
            }}
          />
          <Button onClick={handleSearchSubmit}>Search</Button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <Label className="mb-2 block">Categories</Label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category}`}
                checked={filters.categories?.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              />
              <label
                htmlFor={`cat-${category}`}
                className="text-sm cursor-pointer"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Job Types */}
      <div className="mb-4">
        <Label className="mb-2 block">Job Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {JOB_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type.value}`}
                checked={filters.job_types?.includes(type.value)}
                onCheckedChange={() => handleJobTypeToggle(type.value)}
              />
              <label
                htmlFor={`type-${type.value}`}
                className="text-sm cursor-pointer"
              >
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Remote Only */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remote"
          checked={filters.remote_only}
          onCheckedChange={(checked) =>
            onFilterChange({ remote_only: checked as boolean })
          }
        />
        <label htmlFor="remote" className="text-sm cursor-pointer">
          Remote only
        </label>
      </div>
    </Card>
  );
}
