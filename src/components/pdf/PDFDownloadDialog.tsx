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
import { Download, Eye, FileText, Palette, User, Zap } from "lucide-react";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";
import { useHTMLPDFGeneration } from "@/hooks/useHTMLPDFGeneration";
import { HTMLPDFPreview } from "./HTMLPDFPreview";
import { convertProfileToPDFData, validatePDFData } from "@/utils/profileToPDFConverter";
import { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { ResumeTemplate } from "@/types/pdf";

interface PDFDownloadDialogProps {
  profileData: ProfileDataReturn;
  children: React.ReactNode;
}

const templates: { 
  id: ResumeTemplate | 'professional'; 
  name: string; 
  description: string; 
  icon: React.ReactNode;
  engine: 'html' | 'react-pdf';
  featured?: boolean;
  colorClass: string;
  bgClass: string;
}[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Sophisticated two-column design with dark sidebar',
    icon: <Zap className="w-5 h-5" />,
    engine: 'html',
    featured: true,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/5 border-primary/20',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, professional design with your brand colors',
    icon: <Palette className="w-5 h-5" />,
    engine: 'react-pdf',
    colorClass: 'text-secondary',
    bgClass: 'bg-secondary/5 border-secondary/20',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional resume format, perfect for corporate roles',
    icon: <FileText className="w-5 h-5" />,
    engine: 'react-pdf',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold design that showcases your personality',
    icon: <User className="w-5 h-5" />,
    engine: 'react-pdf',
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50 border-purple-200',
  },
];

export function PDFDownloadDialog({ profileData, children }: PDFDownloadDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | 'professional'>('professional');
  const [isOpen, setIsOpen] = useState(false);
  const [htmlPreviewReady, setHtmlPreviewReady] = useState(false);
  
  const { generatePDF, previewPDF, isGenerating } = usePDFGeneration();
  const { generatePDF: generateHTMLPDF, previewPDF: previewHTMLPDF, isGenerating: isGeneratingHTML } = useHTMLPDFGeneration();

  const pdfData = convertProfileToPDFData(profileData);
  const validation = validatePDFData(pdfData);
  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  const handleDownload = async () => {
    try {
      if (selectedTemplateData?.engine === 'html') {
        await generateHTMLPDF(pdfData);
      } else {
        await generatePDF(pdfData, selectedTemplate as ResumeTemplate);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to download resume:', error);
    }
  };

  const handlePreview = async () => {
    try {
      if (selectedTemplateData?.engine === 'html') {
        await previewHTMLPDF();
      } else {
        await previewPDF(pdfData, selectedTemplate as ResumeTemplate);
      }
    } catch (error) {
      console.error('Failed to preview resume:', error);
    }
  };

  const currentlyGenerating = isGenerating || isGeneratingHTML;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 md:mx-6 max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px]">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md relative ${template.bgClass} ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  {template.featured && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-primary/80 text-xs">
                      New
                    </Badge>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-md ${template.bgClass} ${template.colorClass}`}>
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{template.name}</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.description}
                        </p>
                        <Badge variant="outline" className="text-xs mt-2">
                          {template.engine === 'html' ? 'Advanced Layout' : 'Standard'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Preview Section for HTML Templates */}
          {selectedTemplateData?.engine === 'html' && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Live Preview</h4>
              <div className="border rounded-lg overflow-hidden bg-gray-50" style={{ height: '400px' }}>
                <HTMLPDFPreview 
                  data={pdfData} 
                  template={selectedTemplate as any}
                  onReady={() => setHtmlPreviewReady(true)}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="flex-1 w-full sm:w-auto"
              disabled={currentlyGenerating || (selectedTemplateData?.engine === 'html' && !htmlPreviewReady)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {selectedTemplateData?.engine === 'html' ? 'Open in New Tab' : 'Preview'}
            </Button>
            
            <Button
              onClick={handleDownload}
              className="flex-1 w-full sm:w-auto"
              disabled={currentlyGenerating || (selectedTemplateData?.engine === 'html' && !htmlPreviewReady)}
              style={{
                backgroundColor: profileData.highlightColor || '#FF6B4A',
                borderColor: profileData.highlightColor || '#FF6B4A',
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              {currentlyGenerating ? 'Generating...' : 'Download PDF'}
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

      {/* Hidden template for PDF generation - only render when HTML template is selected */}
      {selectedTemplateData?.engine === 'html' && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <HTMLPDFPreview 
            data={pdfData} 
            template={selectedTemplate as any}
          />
        </div>
      )}
    </Dialog>
  );
}