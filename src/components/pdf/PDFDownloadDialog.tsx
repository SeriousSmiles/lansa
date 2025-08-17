import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Eye, FileText, Palette, User } from "lucide-react";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";
import { convertProfileToPDFData, validatePDFData } from "@/utils/profileToPDFConverter";
import { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { ResumeTemplate } from "@/types/pdf";

interface PDFDownloadDialogProps {
  profileData: ProfileDataReturn;
  children: React.ReactNode;
}

const templates: { id: ResumeTemplate; name: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, professional design with your brand colors',
    icon: <Palette className="w-5 h-5" />,
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional resume format, perfect for corporate roles',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold design that showcases your personality',
    icon: <User className="w-5 h-5" />,
  },
];

export function PDFDownloadDialog({ profileData, children }: PDFDownloadDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('modern');
  const [isOpen, setIsOpen] = useState(false);
  const { generatePDF, previewPDF, isGenerating } = usePDFGeneration();

  const pdfData = convertProfileToPDFData(profileData);
  const validation = validatePDFData(pdfData);

  const handleDownload = async () => {
    try {
      await generatePDF(pdfData, selectedTemplate);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to download resume:', error);
    }
  };

  const handlePreview = async () => {
    try {
      await previewPDF(pdfData, selectedTemplate);
    } catch (error) {
      console.error('Failed to preview resume:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Resume
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {profileData.profileImage && (
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{profileData.userName || 'Your Name'}</h3>
                  <p className="text-sm text-muted-foreground">{profileData.userTitle || 'Your Title'}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{profileData.experiences?.length || 0} Experience{(profileData.experiences?.length || 0) !== 1 ? 's' : ''}</Badge>
                    <Badge variant="secondary">{profileData.educationItems?.length || 0} Education</Badge>
                    <Badge variant="secondary">{profileData.userSkills?.length || 0} Skills</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Warnings */}
          {!validation.isValid && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-orange-800 mb-2">Profile Incomplete</h4>
                <p className="text-sm text-orange-700 mb-2">
                  Your resume will still be generated, but consider adding:
                </p>
                <ul className="text-sm text-orange-700 space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Template Selection */}
          <div>
            <h4 className="font-medium mb-3">Choose Template</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{template.name}</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="flex-1"
              disabled={isGenerating}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            <Button
              onClick={handleDownload}
              className="flex-1"
              disabled={isGenerating}
              style={{
                backgroundColor: profileData.highlightColor || '#FF6B4A',
                borderColor: profileData.highlightColor || '#FF6B4A',
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>

          {/* Tips */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h5 className="font-medium mb-2">💡 Pro Tips</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete your profile for the best results</li>
                <li>• Use the preview to see how your resume looks</li>
                <li>• Choose a template that matches your industry</li>
                <li>• Your brand colors will be automatically applied</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}