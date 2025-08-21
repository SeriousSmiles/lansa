import { Badge } from "@/components/ui/badge";

interface StepHeaderProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  image?: string;
  powerMoment?: string;
}

export function StepHeader({ 
  stepNumber, 
  totalSteps, 
  title, 
  subtitle, 
  image,
  powerMoment 
}: StepHeaderProps) {
  return (
    <div className="relative mb-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {image && (
          <div className="md:w-1/2">
            <img 
              src={image} 
              alt={title}
              className="w-full h-64 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}
        <div className={cn(
          image ? "md:w-1/2" : "w-full",
          "text-center md:text-left"
        )}>
          <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Step {stepNumber} of {totalSteps}
            </Badge>
            {powerMoment && (
              <Badge variant="outline" className="border-secondary/30 text-secondary">
                {powerMoment}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-urbanist">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}