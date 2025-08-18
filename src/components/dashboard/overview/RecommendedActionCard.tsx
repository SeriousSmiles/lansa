
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { useNavigate } from "react-router-dom";
import { useActionTracking } from "@/hooks/useActionTracking";
import { useState } from "react";

interface RecommendedActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  delay: number;
  action: string;
  actionType: 'navigate' | 'modal' | 'external';
}

export function RecommendedActionCard({ title, description, buttonText, delay, action, actionType }: RecommendedActionCardProps) {
  const navigate = useNavigate();
  const { track } = useActionTracking();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    
    // Track the action
    await track('recommended_action_clicked', { 
      action_title: title,
      action_type: actionType,
      action_target: action 
    });

    try {
      switch (actionType) {
        case 'navigate':
          navigate(action);
          break;
        case 'modal':
          // Handle modal actions
          if (action === 'ai-coach') {
            // Trigger AI coach - for now navigate to dashboard with AI tab
            navigate('/dashboard');
            // TODO: Add logic to open AI coach tab/modal
          } else if (action === 'pdf-download') {
            // Trigger PDF download modal
            // TODO: Add PDF download logic
            console.log('PDF download action');
          } else if (action === 'share-profile') {
            // Trigger share profile modal
            // TODO: Add share profile logic
            console.log('Share profile action');
          } else if (action === 'growth-card') {
            // Navigate to dashboard where growth cards are shown
            navigate('/dashboard');
          }
          break;
        case 'external':
          window.open(action, '_blank');
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedCard delay={delay} className="animated-card h-auto hover-scale">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm">{description}</p>
        <Button 
          variant="outline" 
          size="full" 
          className="btn-animate" 
          onClick={handleAction}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : buttonText}
        </Button>
      </CardContent>
    </AnimatedCard>
  );
}
