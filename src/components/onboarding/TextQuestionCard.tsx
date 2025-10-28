import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TextQuestionCardProps {
  title: string;
  helper?: string;
  placeholder?: string;
  defaultValue?: string;
  isSubmitting?: boolean;
  stepNumber: number;
  totalSteps: number;
  onSubmit: (value: string) => Promise<void> | void;
}

const TextQuestionCard: React.FC<TextQuestionCardProps> = ({
  title,
  helper,
  placeholder,
  defaultValue = "",
  isSubmitting = false,
  stepNumber,
  totalSteps,
  onSubmit,
}) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index < stepNumber - 1
                  ? "bg-[hsl(var(--primary))]"
                  : index === stepNumber - 1
                  ? "border-2 border-[hsl(var(--primary))]"
                  : "bg-lansa-muted/30"
              }`}
            />
          ))}
        </div>
      </div>

      <Card className="bg-white rounded-2xl overflow-hidden shadow-sm border-2">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--foreground))] text-center">
            {title}
          </h2>
          {helper && (
            <p className="text-[hsl(var(--muted-foreground))] text-center max-w-xl mx-auto">
              {helper}
            </p>
          )}

          <div className="max-w-xl mx-auto w-full">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="min-h-[120px]"
              disabled={isSubmitting}
            />
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => onSubmit(value)}
                disabled={isSubmitting || !value.trim()}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TextQuestionCard;
