import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PowerMirrorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Secure logging - no sensitive data
    console.error('[PowerMirror] Component error boundary triggered');
    
    // In production, you might want to send this to an error tracking service
    if (import.meta.env.PROD) {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="w-full max-w-xl mx-auto bg-card border-border">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Oops! Something went wrong
            </h2>
            <p className="text-muted-foreground">
              We encountered an issue while generating your power mirror. Don't worry, your progress is saved!
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-2">
                What can you do?
              </h4>
              <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                <li>• Try refreshing the page</li>
                <li>• Check your internet connection</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle async errors
export const usePowerMirrorErrorHandler = () => {
  const handleError = (error: any, context: string) => {
    console.error(`[PowerMirror] Error in ${context}`);
    
    // Return user-friendly error message
    return {
      message: "We're having trouble processing your request. Please try again.",
      canRetry: true,
      fallbackData: {
        recruiter_perspective: "You're thinking like someone who wants to create value - that's the foundation of career success!",
        score: 6,
        score_breakdown: {
          clarity: 2,
          relevance: 2,
          realism: 1,
          professional_impression: 1
        },
        coaching_nudge: "Keep building on this foundation - you're on the right track!",
        mirror_message: "You're thinking like someone who wants to create value!",
        key_strengths: ["Value-focused thinking", "Initiative", "Growth mindset"],
        employer_perspective: "This person understands that work is about creating impact, not just completing tasks.",
        next_level_hint: "Keep building on this foundation - you're on the right track!"
      }
    };
  };

  return { handleError };
};