import { cn } from "@/lib/utils";
import { PasswordValidation } from "@/hooks/usePasswordValidation";

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidation;
  className?: string;
}

export function PasswordStrengthIndicator({ validation, className }: PasswordStrengthIndicatorProps) {
  const getStrengthColor = () => {
    if (validation.score >= 80) return "bg-green-500";
    if (validation.score >= 60) return "bg-yellow-500";
    if (validation.score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthText = () => {
    if (validation.score >= 80) return "Strong";
    if (validation.score >= 60) return "Good";
    if (validation.score >= 40) return "Fair";
    return "Weak";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength</span>
        <span className={cn(
          "font-medium",
          validation.score >= 80 ? "text-green-600" :
          validation.score >= 60 ? "text-yellow-600" :
          validation.score >= 40 ? "text-orange-600" : "text-red-600"
        )}>
          {getStrengthText()}
        </span>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={cn("h-2 rounded-full transition-all duration-300", getStrengthColor())}
          style={{ width: `${validation.score}%` }}
        />
      </div>

      {validation.feedback.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Password must include:</p>
          <ul className="space-y-0.5">
            {validation.feedback.map((requirement, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                {requirement}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}