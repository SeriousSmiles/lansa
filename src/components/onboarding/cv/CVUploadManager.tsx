import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CVDataService } from '@/services/cvDataService';
import { CVUploadArea } from './CVUploadArea';
import { CVProcessingStages } from './CVProcessingStages';
import { CVAnalysisResults } from './CVAnalysisResults';
import { CVUploadHistory } from './CVUploadHistory';
import { AlertTriangle, RefreshCw, Clock, Zap } from 'lucide-react';

interface CVUploadManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
  showHistory?: boolean;
}

type UploadStage = 'upload' | 'processing' | 'analyzing' | 'results' | 'error' | 'history';

interface CVAnalysisData {
  extractedData: {
    name?: string;
    title?: string;
    summary?: string;
    contact?: {
      email?: string;
      phone?: string;
      location?: string;
    };
    skills?: string[];
    experience?: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
  };
  suggestions: {
    skillMatches: string[];
    gapAnalysis: string[];
    improvements: string[];
    mismatchWarnings?: string[];
    confidence: number;
  };
  metadata?: {
    originalFileName: string;
    uploadedAt: string;
    extractionConfidence: number;
    sectionsFound: string[];
  };
}

export function CVUploadManager({ 
  open, 
  onOpenChange, 
  onComplete,
  showHistory = false 
}: CVUploadManagerProps) {
  const [currentStage, setCurrentStage] = useState<UploadStage>(showHistory ? 'history' : 'upload');
  const [analysisData, setAnalysisData] = useState<CVAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const resetUploadState = useCallback(() => {
    setCurrentStage('upload');
    setAnalysisData(null);
    setError(null);
    setSelectedFile(null);
    setRetryCount(0);
    setProcessingStartTime(null);
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload your CV",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setCurrentStage('processing');
    setError(null);
    setProcessingStartTime(Date.now());

    try {
      // Start the parsing process
      setCurrentStage('analyzing');
      
      const result = await CVDataService.uploadAndParseCV(file, user.id);
      
      // Check if we got valid data
      if (!result.extractedData || Object.keys(result.extractedData).length === 0) {
        throw new Error('No data could be extracted from your CV. Please ensure it\'s a readable PDF with clear text.');
      }

      // Validate minimum required data
      const hasMinimumData = (
        (result.extractedData.skills && result.extractedData.skills.length > 0) ||
        (result.extractedData.experience && result.extractedData.experience.length > 0) ||
        (result.extractedData.education && result.extractedData.education.length > 0)
      );

      if (!hasMinimumData) {
        throw new Error('Unable to extract meaningful data from your CV. Please check if the PDF is text-based (not scanned) and try again.');
      }

      setAnalysisData(result);
      setCurrentStage('results');
      
      // Track successful upload
      const processingTime = processingStartTime ? Date.now() - processingStartTime : 0;
      console.log(`CV processed successfully in ${processingTime}ms`);
      
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      setError(error.message || 'Failed to process your CV. Please try again.');
      setCurrentStage('error');
    }
  };

  const handleRetry = useCallback(() => {
    if (selectedFile && retryCount < 3) {
      setRetryCount(prev => prev + 1);
      handleFileUpload(selectedFile);
    } else {
      setError('Maximum retry attempts reached. Please try a different file or contact support.');
    }
  }, [selectedFile, retryCount]);

  const handleApplyData = async (selectedData: Partial<CVAnalysisData['extractedData']>) => {
    if (!user?.id || !analysisData) return;

    try {
      await CVDataService.applyCVDataToProfile(user.id, selectedData);
      
      toast({
        title: "Profile updated successfully!",
        description: "Your CV data has been added to your profile",
      });
      
      onComplete?.();
      onOpenChange(false);
      resetUploadState();
      
    } catch (error: any) {
      console.error('Error applying CV data:', error);
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = () => {
    onComplete?.();
    onOpenChange(false);
    resetUploadState();
  };

  const showUploadHistory = () => {
    setCurrentStage('history');
  };

  const backToUpload = () => {
    setCurrentStage('upload');
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 'upload':
        return (
          <div className="space-y-6">
            <CVUploadArea onFileUpload={handleFileUpload} />
            
            <div className="flex justify-between items-center pt-4 border-t">
              <Button 
                variant="ghost" 
                onClick={showUploadHistory}
                className="text-sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                View Upload History
              </Button>
              <Button variant="outline" onClick={handleSkip}>
                Skip for Now
              </Button>
            </div>
          </div>
        );

      case 'processing':
      case 'analyzing':
        return (
          <CVProcessingStages
            fileName={selectedFile?.name || 'CV'}
            stage={currentStage}
            startTime={processingStartTime}
            onCancel={() => {
              setCurrentStage('upload');
              setSelectedFile(null);
            }}
          />
        );

      case 'results':
        return analysisData ? (
          <CVAnalysisResults
            data={analysisData}
            onApply={handleApplyData}
            onSkip={handleSkip}
            fileName={selectedFile?.name}
          />
        ) : null;

      case 'error':
        return (
          <div className="space-y-6 py-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-red-900">Upload Failed</h3>
              <p className="text-red-700">{error}</p>
            </div>

            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Common issues:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Scanned PDFs (try a text-based PDF instead)</li>
                  <li>Password-protected or encrypted files</li>
                  <li>Very large files (over 10MB)</li>
                  <li>Poor image quality or unclear text</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 justify-center">
              {selectedFile && retryCount < 3 && (
                <Button onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again ({3 - retryCount} attempts left)
                </Button>
              )}
              <Button variant="outline" onClick={resetUploadState}>
                Choose Different File
              </Button>
              <Button variant="ghost" onClick={handleSkip}>
                Skip for Now
              </Button>
            </div>
          </div>
        );

      case 'history':
        return (
          <CVUploadHistory 
            userId={user?.id}
            onBack={backToUpload}
            onReuse={(data) => {
              setAnalysisData(data);
              setCurrentStage('results');
            }}
          />
        );

      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (currentStage) {
      case 'upload': return 'Upload Your CV/Resume';
      case 'processing': return 'Processing Your CV';
      case 'analyzing': return 'Analyzing Content';
      case 'results': return 'CV Analysis Complete';
      case 'error': return 'Upload Error';
      case 'history': return 'Upload History';
      default: return 'CV Upload';
    }
  };

  const getDialogDescription = () => {
    switch (currentStage) {
      case 'upload': 
        return 'Upload your CV to automatically fill your profile with your experience, skills, and education.';
      case 'processing':
      case 'analyzing':
        return 'Our AI is reading and understanding your CV content...';
      case 'results':
        return 'Review the extracted information and choose what to add to your profile.';
      case 'error':
        return 'There was an issue processing your CV. Please try again or contact support.';
      case 'history':
        return 'View your previous CV uploads and reuse extracted data.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          {renderStageContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}