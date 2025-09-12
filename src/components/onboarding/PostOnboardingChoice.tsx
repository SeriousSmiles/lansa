import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, User, Sparkles, Edit, FileText, Upload, Zap } from "lucide-react";
import { CVUploadModal } from "./cv/CVUploadModal";

interface PostOnboardingChoiceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChooseAIGuide: () => void;
  onChooseManual: () => void;
  onChooseCVUpload?: () => void;
}

export function PostOnboardingChoice({ 
  open, 
  onOpenChange, 
  onChooseAIGuide, 
  onChooseManual,
  onChooseCVUpload 
}: PostOnboardingChoiceProps) {
  const [showCVModal, setShowCVModal] = useState(false);

  const handleCVUploadClick = () => {
    setShowCVModal(true);
  };

  const handleCVUploadComplete = () => {
    setShowCVModal(false);
    onOpenChange(false);
    onChooseCVUpload?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">Complete Your Profile</DialogTitle>
            <p className="text-muted-foreground">
              Choose how you'd like to build your professional profile
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* CV Upload Option - PRIMARY */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50 relative">
              <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                ⚡ Fast
              </div>
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Start from CV/Resume</CardTitle>
                <CardDescription className="text-sm">
                  Upload your CV and we'll build your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Auto-extract skills & experience
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Find gaps & improvements
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Instant profile foundation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Save hours of typing
                  </li>
                </ul>
                <Button 
                  onClick={handleCVUploadClick}
                  className="w-full mt-4"
                  size="lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CV/Resume
                </Button>
              </CardContent>
            </Card>
            {/* AI Guide Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50">
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">AI-Powered Guide</CardTitle>
                <CardDescription className="text-sm">
                  Get personalized suggestions and guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Chat-based assistance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Personalized content suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Step-by-step guidance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    AI-optimized content
                  </li>
                </ul>
                <Button 
                  onClick={onChooseAIGuide}
                  variant="outline"
                  className="w-full mt-4"
                  size="lg"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Use AI Guide
                </Button>
              </CardContent>
            </Card>

            {/* Manual Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-secondary/50">
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center mb-3">
                  <User className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-lg">Start from Scratch</CardTitle>
                <CardDescription className="text-sm">
                  Fill out your profile independently
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Complete control
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Self-paced completion
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Direct editing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    No AI assistance
                  </li>
                </ul>
                <Button 
                  onClick={onChooseManual}
                  variant="outline"
                  className="w-full mt-4"
                  size="lg"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Fill Manually
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-6 text-xs text-muted-foreground">
            You can always access these options later from your profile settings
          </div>
        </DialogContent>
      </Dialog>

      <CVUploadModal 
        open={showCVModal}
        onOpenChange={setShowCVModal}
        onComplete={handleCVUploadComplete}
      />
    </>
  );
}