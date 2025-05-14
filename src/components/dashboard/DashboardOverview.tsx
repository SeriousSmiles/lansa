
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

type DashboardOverviewProps = {
  userName: string;
  role: string;
  goal: string;
  insight: string;
  highlightActions: boolean;
};

export function DashboardOverview({ 
  userName, 
  role, 
  goal, 
  insight,
  highlightActions
}: DashboardOverviewProps) {
  
  useEffect(() => {
    // Show welcome toast if highlighting actions
    if (highlightActions) {
      toast({
        title: "Welcome!",
        description: "Here are your recommended actions to get started.",
        duration: 5000,
      });
    }
  }, [highlightActions]);
  
  return (
    <div className="pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="h-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg md:text-xl">Your Profile</CardTitle>
            <CardDescription>Based on your onboarding answers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-base md:text-lg">{role}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Goal</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-base md:text-lg">{goal}</p>
                </div>
              </div>
              <div className="pt-1">
                <Link to="/profile">
                  <Button variant="outline" size="sm">View Full Profile</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="h-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg md:text-xl">Your Insight</CardTitle>
            <CardDescription>Personalized for your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base md:text-lg italic">"{insight}"</p>
          </CardContent>
        </Card>
      </div>
      
      <RecommendedActions highlightActions={highlightActions} />
    </div>
  );
}

function RecommendedActions({ highlightActions }: { highlightActions: boolean }) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">Recommended Actions</h2>
        {highlightActions && (
          <div className="bg-[#FF6B4A]/20 text-[#FF6B4A] px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            Start here
          </div>
        )}
      </div>
      
      <div 
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${
          highlightActions ? 'ring-2 ring-[#FF6B4A] ring-offset-4 rounded-lg p-4 animate-[scale-in_0.5s_ease-out]' : ''
        }`}
      >
        <ActionCard 
          title="Define Your Message" 
          description="Clarify how you talk about yourself and your work to resonate with your audience." 
          buttonText="Start Exercise"
        />
        
        <ActionCard 
          title="Build Your Presence" 
          description="Create a standout online profile that showcases your unique value." 
          buttonText="Start Building"
        />
        
        <ActionCard 
          title="Track Progress" 
          description="See your journey toward greater clarity and professional visibility." 
          buttonText="View Progress"
        />
      </div>
    </>
  );
}

type ActionCardProps = {
  title: string;
  description: string;
  buttonText: string;
};

function ActionCard({ title, description, buttonText }: ActionCardProps) {
  return (
    <Card className="h-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm">{description}</p>
        <Button variant="outline" size="sm" className="w-full">{buttonText}</Button>
      </CardContent>
    </Card>
  );
}
