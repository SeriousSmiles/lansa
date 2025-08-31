import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface OnboardingCardProps {
  children: ReactNode;
  image?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  stepBadge?: string;
  className?: string;
}

export function OnboardingCard({
  children,
  image,
  imageAlt,
  title,
  subtitle,
  stepBadge,
  className = ""
}: OnboardingCardProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Image */}
        {image && (
          <div className="w-full lg:w-1/2">
            <img 
              src={image} 
              alt={imageAlt || title}
              className="w-full h-56 lg:h-64 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}
        
        {/* Title & Subtitle */}
        <div className={`w-full ${image ? 'lg:w-1/2' : ''} text-center lg:text-left space-y-4`}>
          {stepBadge && (
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
              {stepBadge}
            </div>
          )}
          
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground font-urbanist leading-tight">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Content Card */}
      <Card className="shadow-lg border-border bg-card">
        <CardContent className="p-6 lg:p-8">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}