import { Card } from "@/components/ui/card";

interface StrengthsFocusCardProps {
  strengths: string[];
  focusAreas: string[];
}

export function StrengthsFocusCard({ strengths, focusAreas }: StrengthsFocusCardProps) {
  return (
    <Card className="p-4 sm:p-6 mb-6">
      <h3 className="text-lg sm:text-xl font-bold mb-4">🎯 Your Professional Profile</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Strengths */}
        <div>
          <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 mb-3">✅ Strengths</p>
          <div className="flex flex-wrap gap-2">
            {strengths.map((strength, i) => (
              <span key={i} className="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 rounded-full text-xs sm:text-sm font-medium">
                {strength}
              </span>
            ))}
          </div>
        </div>
        
        {/* Focus Areas */}
        <div>
          <p className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400 mb-3">🎯 Focus Areas</p>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area, i) => (
              <span key={i} className="px-2 sm:px-3 py-1 bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300 rounded-full text-xs sm:text-sm font-medium">
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
