import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CVUploadArea } from "./CVUploadArea";
import { CVParsingProgress } from "./CVParsingProgress";
import { EnhancedCVAnalysisResults } from "./EnhancedCVAnalysisResults";
import { CVLoadingProgress } from "./CVLoadingProgress";
import { FileText, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CVUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

type CVUploadStep = 'upload' | 'parsing' | 'results';

export interface CVAnalysisData {
  extractedData: {
    name?: string;
    title?: string;
    summary?: string;
    skills: string[];
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    contact?: {
      email?: string;
      phone?: string;
    };
  };
  suggestions: {
    skillMatches: string[];
    gapAnalysis: string[];
    improvements: string[];
    mismatchWarnings?: string[];
    confidence: number;
  };
}

export function CVUploadModal({ open, onOpenChange, onComplete }: CVUploadModalProps) {
  const [currentStep, setCurrentStep] = useState<CVUploadStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<CVAnalysisData | null>(null);
  const { user } = useAuth();

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setCurrentStep('parsing');
    
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      console.log(`Processing ${file.name} via Lovable AI`);

      // Import the CV data service and parse the CV
      const { CVDataService } = await import("@/services/cvDataService");
      const analysisResult = await CVDataService.uploadAndParseCV(file, user.id);
      
      // Convert to expected format
      const analysisData: CVAnalysisData = {
        extractedData: {
          name: analysisResult.extractedData.personalInfo?.name,
          title: analysisResult.extractedData.personalInfo?.title,
          summary: analysisResult.extractedData.personalInfo?.summary,
          skills: analysisResult.extractedData.skills || [],
          experience: analysisResult.extractedData.experience || [],
          education: analysisResult.extractedData.education || [],
          contact: {
            email: analysisResult.extractedData.personalInfo?.email,
            phone: analysisResult.extractedData.personalInfo?.phone,
          }
        },
        suggestions: analysisResult.suggestions
      };

      setAnalysisData(analysisData);
      setCurrentStep('results');
    } catch (error) {
      console.error('Error processing CV:', error);
      // Show error to user instead of mock data
      setCurrentStep('upload');
      throw error;
    }
  };

  const handleApplyData = async (selectedData: Partial<CVAnalysisData['extractedData']>) => {
    try {
      // Import the CV data service
      const { CVDataService } = await import("@/services/cvDataService");
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Convert the data to the format expected by applyCVDataToProfile
      const convertedData: Partial<import("@/services/cvDataService").CVExtractedData> = {};

      // Map personal info
      if (selectedData.name || selectedData.title || selectedData.summary || selectedData.contact) {
        convertedData.personalInfo = {
          name: selectedData.name,
          title: selectedData.title,
          summary: selectedData.summary,
          email: selectedData.contact?.email,
          phone: selectedData.contact?.phone,
        };
      }

      // Map skills
      if (selectedData.skills) {
        convertedData.skills = selectedData.skills;
      }

      // Map experience
      if (selectedData.experience) {
        convertedData.experience = selectedData.experience.map((exp, index) => ({
          title: exp.title,
          company: exp.company,
          duration: exp.duration,
          description: exp.description,
          source: 'resume-upload',
          order_index: index,
          is_user_edited: false
        }));
      }

      // Map education
      if (selectedData.education) {
        convertedData.education = selectedData.education.map((edu, index) => ({
          degree: edu.degree,
          institution: edu.institution,
          year: edu.year,
          source: 'resume-upload',
          order_index: index,
          is_user_edited: false
        }));
      }

      await CVDataService.applyCVDataToProfile(user.id, convertedData);
      onComplete();
    } catch (error) {
      console.error('Error applying CV data:', error);
      throw error; // Re-throw to show error to user
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const resetModal = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setAnalysisData(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        resetModal();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        {currentStep === 'upload' && (
          <>
            <DialogHeader className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold">Upload Your CV/Resume</DialogTitle>
              <p className="text-muted-foreground">
                Skip the blank page. Upload your CV and we'll jumpstart your profile.
              </p>
            </DialogHeader>
            <div className="mt-6">
              <CVUploadArea onFileUpload={handleFileUpload} />
            </div>
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={handleSkip}>
                Skip for Now
              </Button>
            </div>
          </>
        )}

        {currentStep === 'parsing' && (
          <>
            <DialogHeader className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white animate-spin" />
              </div>
              <DialogTitle className="text-2xl font-bold">Analyzing Your CV</DialogTitle>
            </DialogHeader>
            <div className="mt-6">
              <CVLoadingProgress fileName={uploadedFile?.name || "your-cv.pdf"} />
            </div>
          </>
        )}

        {currentStep === 'results' && analysisData && (
          <>
            <DialogHeader className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold">Your Profile is Ready!</DialogTitle>
              <p className="text-muted-foreground">
                We've analyzed your CV and found great content to build your profile
              </p>
            </DialogHeader>
            <div className="mt-6">
              <EnhancedCVAnalysisResults 
                data={analysisData}
                onApply={handleApplyData}
                onSkip={handleSkip}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}