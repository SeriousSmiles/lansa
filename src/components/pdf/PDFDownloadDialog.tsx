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
import { Download, Eye, FileText, Palette, User, Zap, Settings, Maximize } from "lucide-react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFGenerator } from "./PDFGenerator";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";
import { HTMLPDFPreview } from "./HTMLPDFPreview";
import { PDFPreviewControls } from "./PDFPreviewControls";
import { convertProfileToPDFData, validatePDFData } from "@/utils/profileToPDFConverter";
import { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { ResumeTemplate } from "@/types/pdf";
import { useIsMobile } from "@/hooks/use-mobile";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PDFDownloadDialogProps {
  profileData: ProfileDataReturn;
  children: React.ReactNode;
}

const templates: { 
  id: ResumeTemplate; 
  name: string; 
  description: string; 
  icon: React.ReactNode;
  featured?: boolean;
  colorClass: string;
  bgClass: string;
}[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean design with geometric elements and brand colors',
    icon: <Palette className="w-5 h-5" />,
    featured: true,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/5 border-primary/20',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional corporate format with elegant typography',
    icon: <FileText className="w-5 h-5" />,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Sophisticated business-focused design with clean layout',
    icon: <Zap className="w-5 h-5" />,
    colorClass: 'text-secondary',
    bgClass: 'bg-secondary/5 border-secondary/20',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Modern design with creative elements and visual impact',
    icon: <User className="w-5 h-5" />,
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50 border-purple-200',
  },
];

export function PDFDownloadDialog({ profileData, children }: PDFDownloadDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('modern');
  const [isOpen, setIsOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isActualSize, setIsActualSize] = useState(false);
  const isMobile = useIsMobile();
  
  const { previewPDF, isGenerating } = usePDFGeneration();

  const pdfData = convertProfileToPDFData(profileData);
  const validation = validatePDFData(pdfData);
  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  const handlePreview = async () => {
    try {
      await previewPDF(pdfData, selectedTemplate);
    } catch (error) {
      console.error('Failed to preview resume:', error);
    }
  };

  const generateFileName = () => {
    const name = pdfData.personalInfo.name.replace(/\s+/g, '_');
    return `${name}_Resume_${selectedTemplate}.pdf`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-h-[90vh] overflow-y-auto overflow-x-hidden w-[95vw] max-w-[calc(100vw-1rem)] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] p-3 sm:p-6">
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
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                {profileData.profileImage && (
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{profileData.userName || 'Your Name'}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{profileData.userTitle || 'Your Title'}</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{profileData.experiences?.length || 0} Experience{(profileData.experiences?.length || 0) !== 1 ? 's' : ''}</Badge>
                    <Badge variant="secondary" className="text-xs">{profileData.educationItems?.length || 0} Education</Badge>
                    <Badge variant="secondary" className="text-xs">{profileData.userSkills?.length || 0} Skills</Badge>
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
            <h4 className="font-medium mb-3 text-left">Choose Template</h4>
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
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                      <div className={`p-2 rounded-md ${template.bgClass} ${template.colorClass} flex-shrink-0`}>
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm sm:text-base">{template.name}</h5>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {template.description}
                        </p>
                        <Badge variant="outline" className="text-xs mt-2">
                          High Quality
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Preview Toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="show-preview"
              checked={showPreview}
              onCheckedChange={setShowPreview}
            />
            <Label htmlFor="show-preview" className="text-sm font-medium">
              Show Preview
            </Label>
            <span className="text-xs text-muted-foreground">
              {showPreview ? 'Preview is visible' : 'Enable to see live preview'}
            </span>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-left">Live Preview</h4>
                <PDFPreviewControls
                  isActualSize={isActualSize}
                  onToggleActualSize={() => setIsActualSize(!isActualSize)}
                  template={selectedTemplate}
                  onTemplateChange={(template) => setSelectedTemplate(template as ResumeTemplate)}
                  availableTemplates={templates.map(t => ({ id: t.id, name: t.name }))}
                />
              </div>
              <div className={`border rounded-lg overflow-hidden bg-gray-50 w-full ${
                isActualSize 
                  ? 'h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]' 
                  : 'h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px]'
              }`}>
                <HTMLPDFPreview 
                  data={pdfData} 
                  template={selectedTemplate}
                  onReady={() => {}}
                  isActualSize={isActualSize}
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
              disabled={isGenerating}
            >
              <Eye className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
            
            <PDFDownloadLink
              document={<PDFGenerator data={pdfData} />}
              fileName={generateFileName()}
              className="flex-1 w-full sm:w-auto"
            >
              {({ loading }) => (
                <Button
                  className="w-full"
                  disabled={loading || isGenerating}
                  style={{
                    backgroundColor: profileData.highlightColor || '#FF6B4A',
                    borderColor: profileData.highlightColor || '#FF6B4A',
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? 'Preparing...' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>

          {/* Tips */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h5 className="font-medium mb-2">💡 Pro Tips</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete your profile for the best results</li>
                <li>• Enable preview to see how your resume looks before downloading</li>
                <li>• Choose a template that matches your industry</li>
                <li>• Your brand colors will be automatically applied</li>
                <li>• Use "Actual Size" in preview to see the real PDF dimensions</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

    </Dialog>
  );
}