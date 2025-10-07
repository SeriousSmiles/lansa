import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, Shield, ImageIcon, FileText } from "lucide-react";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";
import { useHTMLPDFGeneration } from "@/hooks/useHTMLPDFGeneration";
import { useReactPDFGeneration } from "@/hooks/useReactPDFGeneration";
import { useJPEGGeneration } from "@/hooks/useJPEGGeneration";
import { HTMLPDFPreview } from "./HTMLPDFPreview";
import { convertProfileToPDFData, validatePDFData } from "@/utils/profileToPDFConverter";
import { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { ResumeTemplate, PDFGenerationOptions } from "@/types/pdf";
import { useIsMobile } from "@/hooks/use-mobile";
import { templateRegistry } from "./templateRegistry";

interface PDFDownloadDialogProps {
  profileData: ProfileDataReturn;
  children: React.ReactNode;
}

export function PDFDownloadDialog({ profileData, children }: PDFDownloadDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('professional');
  const [isOpen, setIsOpen] = useState(false);
  const [htmlPreviewReady, setHtmlPreviewReady] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'jpeg'>('jpeg');
  const isMobile = useIsMobile();

  // Options state
  const [options, setOptions] = useState<PDFGenerationOptions>({
    template: 'professional',
    includePhoto: true,
    atsSafe: false,
    locale: 'en',
    sections: {
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
      awards: true,
      volunteer: true,
      languages: true,
    },
  });
  
  const { generatePDF, previewPDF, isGenerating } = usePDFGeneration();
  const { generatePDF: generateHTMLPDF, previewPDF: previewHTMLPDF, isGenerating: isGeneratingHTML } = useHTMLPDFGeneration();
  const { generatePDF: generateReactPDF, previewPDF: previewReactPDF, isGenerating: isGeneratingReact } = useReactPDFGeneration();
  const { generateJPEG, previewJPEG, isGenerating: isGeneratingJPEG } = useJPEGGeneration();

  const pdfData = convertProfileToPDFData(profileData);
  const validation = validatePDFData(pdfData);
  const selectedTemplateData = templateRegistry.find(t => t.id === selectedTemplate);

  const handleTemplateSelect = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    setOptions(prev => ({ ...prev, template }));
  };

  const handleDownload = async () => {
    try {
      const currentOptions = { ...options, template: selectedTemplate };
      
      if (exportFormat === 'jpeg') {
        // JPEG export - only works with HTML engine templates
        await generateJPEG(pdfData);
      } else {
        // PDF export
        if (selectedTemplateData?.engine === 'html') {
          await generateHTMLPDF(pdfData);
        } else if (selectedTemplateData?.engine === 'react-pdf') {
          await generateReactPDF(pdfData, selectedTemplate);
        } else {
          await generatePDF(pdfData, selectedTemplate);
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to download resume:', error);
    }
  };

  const handlePreview = async () => {
    try {
      if (exportFormat === 'jpeg') {
        // JPEG preview
        await previewJPEG();
      } else {
        // PDF preview
        if (selectedTemplateData?.engine === 'html') {
          await previewHTMLPDF();
        } else if (selectedTemplateData?.engine === 'react-pdf') {
          await previewReactPDF(pdfData, selectedTemplate);
        } else {
          await previewPDF(pdfData, selectedTemplate);
        }
      }
    } catch (error) {
      console.error('Failed to preview resume:', error);
    }
  };

  const currentlyGenerating = isGenerating || isGeneratingHTML || isGeneratingReact || isGeneratingJPEG;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden w-[90vw] max-w-[calc(100vw-2rem)] sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[900px] xl:max-w-[1100px] p-4 sm:p-6">
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
                    <Badge variant="secondary" className="text-xs">{profileData.experiences?.length || 0} Experience</Badge>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {templateRegistry.map((template) => {
                const Icon = template.icon;
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md relative ${template.bgClass} ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    {template.featured && (
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-primary/80 text-xs">
                        Featured
                      </Badge>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                        <div className={`p-2 rounded-md ${template.bgClass} ${template.colorClass} flex-shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm">{template.name}</h5>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex gap-1 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            {template.supportsATS && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                ATS
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Export Format Selection */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="font-medium">Export Format</h4>
              
              <RadioGroup value={exportFormat} onValueChange={(value: 'pdf' | 'jpeg') => setExportFormat(value)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* JPEG Option - Free */}
                  <div className="relative">
                    <Label
                      htmlFor="format-jpeg"
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        exportFormat === 'jpeg'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="jpeg" id="format-jpeg" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ImageIcon className="w-4 h-4" />
                          <span className="font-medium">JPEG Image</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Free</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Print-ready A4 image at 300 DPI. Perfect quality, smaller file size.
                        </p>
                      </div>
                    </Label>
                  </div>

                  {/* PDF Option - Premium */}
                  <div className="relative">
                    <Label
                      htmlFor="format-pdf"
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        exportFormat === 'pdf'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="pdf" id="format-pdf" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">PDF Document</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">Premium</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Searchable PDF with advanced templates. Best for ATS systems.
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {exportFormat === 'jpeg' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>💡 Why JPEG?</strong> Pixel-perfect rendering, consistent across all devices, 
                    smaller file sizes, and universal compatibility. Perfect for sharing and printing!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Options Panel */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="font-medium">Customization Options</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ATS Mode */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ats-mode"
                    checked={options.atsSafe}
                    onCheckedChange={(checked) =>
                      setOptions(prev => ({ ...prev, atsSafe: checked as boolean }))
                    }
                  />
                  <Label htmlFor="ats-mode" className="text-sm cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      ATS-Safe Mode
                    </div>
                    <span className="text-xs text-muted-foreground">Optimized for applicant tracking systems</span>
                  </Label>
                </div>

                {/* Include Photo */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-photo"
                    checked={options.includePhoto && !options.atsSafe}
                    disabled={options.atsSafe}
                    onCheckedChange={(checked) =>
                      setOptions(prev => ({ ...prev, includePhoto: checked as boolean }))
                    }
                  />
                  <Label htmlFor="include-photo" className="text-sm cursor-pointer">
                    Include Photo
                  </Label>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm">Language</Label>
                  <Select
                    value={options.locale}
                    onValueChange={(value: 'en' | 'nl' | 'pap') =>
                      setOptions(prev => ({ ...prev, locale: value }))
                    }
                  >
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="nl">Nederlands</SelectItem>
                      <SelectItem value="pap">Papiamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview Toggle */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-preview"
                    checked={showPreview}
                    onCheckedChange={(checked) => setShowPreview(checked as boolean)}
                  />
                  <Label htmlFor="show-preview" className="text-sm cursor-pointer">
                    Show Live Preview
                  </Label>
                </div>
              </div>

              {/* Section Toggles */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Include Sections</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(options.sections).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`section-${key}`}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setOptions(prev => ({
                            ...prev,
                            sections: { ...prev.sections, [key]: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor={`section-${key}`} className="text-xs cursor-pointer capitalize">
                        {key}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {showPreview && selectedTemplateData?.engine === 'html' && (
            <div>
              <h4 className="font-medium mb-3 text-left">Live Preview</h4>
              <div className="border rounded-lg overflow-hidden bg-gray-50 w-full max-w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px]">
                <HTMLPDFPreview 
                  data={pdfData} 
                  template={selectedTemplate}
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
              disabled={currentlyGenerating || (selectedTemplateData?.engine === 'html' && showPreview && !htmlPreviewReady)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {selectedTemplateData?.engine === 'react-pdf' ? 'Preview in New Tab' : 'Preview'}
            </Button>
            
            <Button
              onClick={handleDownload}
              className="flex-1 w-full sm:w-auto"
              disabled={currentlyGenerating || (exportFormat === 'jpeg' && showPreview && !htmlPreviewReady) || (selectedTemplateData?.engine === 'html' && showPreview && !htmlPreviewReady)}
              style={{
                backgroundColor: profileData.highlightColor || '#FF6B4A',
                borderColor: profileData.highlightColor || '#FF6B4A',
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              {currentlyGenerating ? 'Generating...' : `Download ${exportFormat === 'jpeg' ? 'Image' : 'PDF'}`}
            </Button>
          </div>

          {/* Tips */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h5 className="font-medium mb-2">💡 Pro Tips</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enable ATS Mode when applying to large companies with automated screening</li>
                <li>• Use Preview to ensure everything looks perfect before downloading</li>
                <li>• Choose templates that match your industry and career level</li>
                <li>• Your brand colors will be automatically applied (unless ATS Mode is on)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      {/* Hidden templates for generation */}
      {!showPreview && (
        <>
          {/* Preview template for screen viewing */}
          {selectedTemplateData?.engine === 'html' && (
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
              <HTMLPDFPreview 
                data={pdfData} 
                template={selectedTemplate}
                forExport={false}
              />
            </div>
          )}
          
          {/* Export template for JPEG generation (pixel-perfect) */}
          {exportFormat === 'jpeg' && selectedTemplate === 'professional' && (
            <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
              <HTMLPDFPreview 
                data={pdfData} 
                template={selectedTemplate}
                forExport={true}
              />
            </div>
          )}
        </>
      )}
    </Dialog>
  );
}
