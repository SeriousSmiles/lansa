
interface StaticExperienceCardProps {
  title: string;
  period: string;
  subtitle: string;
  description: string;
  highlightColor?: string; // Added highlightColor property
}

export function StaticExperienceCard({ 
  title, 
  period, 
  subtitle, 
  description,
  highlightColor = "#FF6B4A" // Default to original orange
}: StaticExperienceCardProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>{title}</h3>
        <span className="text-sm text-muted-foreground">{period}</span>
      </div>
      <div className="text-sm text-muted-foreground">{subtitle}</div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
