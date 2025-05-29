
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface YearRangeInputProps {
  startYear?: number;
  endYear?: number | null;
  onStartYearChange: (year: number | undefined) => void;
  onEndYearChange: (year: number | null) => void;
  highlightColor?: string;
}

export function YearRangeInput({
  startYear,
  endYear,
  onStartYearChange,
  onEndYearChange,
  highlightColor = "#FF6B4A"
}: YearRangeInputProps) {
  const currentYear = new Date().getFullYear();
  const isPresent = endYear === null;

  const handleStartYearChange = (value: string) => {
    const year = parseInt(value);
    onStartYearChange(isNaN(year) ? undefined : year);
  };

  const handleEndYearChange = (value: string) => {
    const year = parseInt(value);
    onEndYearChange(isNaN(year) ? undefined : year);
  };

  const handlePresentToggle = (checked: boolean) => {
    if (checked) {
      onEndYearChange(null); // null means "Present"
    } else {
      onEndYearChange(currentYear); // Default to current year
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Duration</label>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            type="number"
            placeholder="Start year"
            value={startYear || ''}
            onChange={(e) => handleStartYearChange(e.target.value)}
            min="1900"
            max={currentYear}
          />
        </div>
        <span className="text-gray-500">to</span>
        <div className="flex-1">
          <Input
            type="number"
            placeholder="End year"
            value={isPresent ? '' : (endYear || '')}
            onChange={(e) => handleEndYearChange(e.target.value)}
            min="1900"
            max={currentYear + 10}
            disabled={isPresent}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="present"
          checked={isPresent}
          onCheckedChange={handlePresentToggle}
        />
        <label 
          htmlFor="present" 
          className="text-sm cursor-pointer"
          style={{ color: highlightColor }}
        >
          I currently work/study here
        </label>
      </div>
    </div>
  );
}
