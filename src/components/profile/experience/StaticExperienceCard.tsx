
import React from "react";

interface StaticExperienceCardProps {
  title: string;
  period: string;
  subtitle: string;
  description: string;
}

export function StaticExperienceCard({ 
  title, 
  period, 
  subtitle, 
  description 
}: StaticExperienceCardProps) {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/3">
        <h3 className="text-lg font-semibold text-[#FF6B4A]">{title}</h3>
        <p className="text-gray-500">{period}</p>
      </div>
      <div className="md:w-2/3">
        <h4 className="font-medium">{subtitle}</h4>
        <p className="text-gray-600 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
