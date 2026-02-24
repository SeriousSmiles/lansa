import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  TrendingDown,
  RefreshCw
} from "lucide-react";
import { CVAnalysisData } from "./CVUploadModal";
import { cn } from "@/lib/utils";

interface EnhancedCVAnalysisResultsProps {
  data: CVAnalysisData;
  onApply: (selectedData: Partial<CVAnalysisData['extractedData']>) => void;
  onSkip: () => void;
  onRetry?: () => void;
  isLoading?: boolean;
}

interface SectionSelection {
  personalInfo: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
}

export function EnhancedCVAnalysisResults({ 
  data, 
  onApply, 
  onSkip, 
  onRetry,
  isLoading = false
}: EnhancedCVAnalysisResultsProps) {
  const navigate = useNavigate();
  const [selections, setSelections] = useState<SectionSelection>({
    personalInfo: true,
    skills: true,
    experience: true,
    education: true,
  });
  
  const [expandedSections, setExpandedSections] = useState({
    found: true,
    gaps: false,
    improvements: false
  });

  const handleSectionToggle = (section: keyof SectionSelection) => {
    setSelections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleApplyAll = () => {
    const selectedData: Partial<CVAnalysisData['extractedData']> = {};
    
    if (selections.personalInfo) {
      selectedData.name = data.extractedData.name;
      selectedData.title = data.extractedData.title;
      selectedData.summary = data.extractedData.summary;
      selectedData.contact = data.extractedData.contact;
    }
    if (selections.skills) {
      selectedData.skills = data.extractedData.skills;
    }
    if (selections.experience) {
      selectedData.experience = data.extractedData.experience;
    }
    if (selections.education) {
      selectedData.education = data.extractedData.education;
    }

    onApply(selectedData);
  };

  const selectedCount = Object.values(selections).filter(Boolean).length;
  const confidence = Math.round(data.suggestions.confidence);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Sparkles className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium">Analyzing your CV...</p>
          <p className="text-sm text-muted-foreground">This should take less than a minute</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confidence Score Header */}
      <div className="text-center space-y-3 pb-4 border-b">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{confidence}%</span>
        </div>
        <div>
          <h3 className="text-xl font-semibold">
            {confidence >= 80 ? "Excellent match!" : confidence >= 60 ? "Good foundation!" : "Let's improve this together!"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.extractedData.name && (
              <>Name: {data.extractedData.name} • </>
            )}
            {data.extractedData.skills.length} skills • {data.extractedData.experience.length} roles • {data.extractedData.education.length} education entries
          </p>
        </div>
      </div>

      {/* Mismatch Warnings */}
      {data.suggestions.mismatchWarnings && data.suggestions.mismatchWarnings.length > 0 && (
        <Card className="border-l-4 border-l-red-500 bg-red-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-base text-red-800">Let's align your story</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 mb-3">
              {data.suggestions.mismatchWarnings.map((warning, index) => (
                <p key={index} className="text-sm text-red-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  {warning}
                </p>
              ))}
            </div>
            <p className="text-xs text-red-600 mb-3">
              No worries - we'll help you create a consistent narrative that showcases your growth!
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => navigate('/profile')}>
                Review Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Three Coaching Cards */}
      <div className="space-y-4">
        {/* Card 1: What We Found - Default Expanded */}
        <Collapsible open={expandedSections.found} onOpenChange={() => toggleSection('found')}>
          <Card className="border-l-4 border-l-green-500">
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-green-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-base">What We Found in Your CV</CardTitle>
                  </div>
                  {expandedSections.found ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <CardDescription>
                  Great start — we extracted {data.extractedData.skills.length} skills and {data.extractedData.experience.length} experiences
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Personal Info Preview */}
                  {(data.extractedData.name || data.extractedData.title || data.extractedData.contact?.email) && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Personal Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        {data.extractedData.name && (
                          <p><span className="font-medium">Name:</span> {data.extractedData.name}</p>
                        )}
                        {data.extractedData.title && (
                          <p><span className="font-medium">Title:</span> {data.extractedData.title}</p>
                        )}
                        {data.extractedData.contact?.email && (
                          <p><span className="font-medium">Email:</span> {data.extractedData.contact.email}</p>
                        )}
                        {data.extractedData.contact?.phone && (
                          <p><span className="font-medium">Phone:</span> {data.extractedData.contact.phone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills Preview */}
                  {data.extractedData.skills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Skills Detected ({data.extractedData.skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {data.extractedData.skills.slice(0, 8).map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-green-50 text-green-700 text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {data.extractedData.skills.length > 8 && (
                          <Badge variant="outline" className="text-xs">
                            +{data.extractedData.skills.length - 8} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Experience Summary */}
                  {data.extractedData.experience.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Work Experience ({data.extractedData.experience.length})
                      </h4>
                      <div className="space-y-2">
                        {data.extractedData.experience.slice(0, 2).map((exp, index) => (
                          <div key={index} className="text-sm border-l-2 border-green-200 pl-3">
                            <p className="font-medium">{exp.title}</p>
                            <p className="text-muted-foreground">{exp.company} • {exp.duration}</p>
                          </div>
                        ))}
                        {data.extractedData.experience.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{data.extractedData.experience.length - 2} more positions</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Education Summary */}
                  {data.extractedData.education.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Education ({data.extractedData.education.length})
                      </h4>
                      <div className="space-y-2">
                        {data.extractedData.education.slice(0, 2).map((edu, index) => (
                          <div key={index} className="text-sm border-l-2 border-green-200 pl-3">
                            <p className="font-medium">{edu.degree}</p>
                            <p className="text-muted-foreground">{edu.institution} • {edu.year}</p>
                          </div>
                        ))}
                        {data.extractedData.education.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{data.extractedData.education.length - 2} more entries</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Card 2: Gaps for Your Target Role - Collapsed by Default */}
        <Collapsible open={expandedSections.gaps} onOpenChange={() => toggleSection('gaps')}>
          <Card className="border-l-4 border-l-orange-500">
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-orange-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-base">Gaps for Your Target Role</CardTitle>
                  </div>
                  {expandedSections.gaps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <CardDescription>
                  {data.suggestions.gapAnalysis.length} opportunities to strengthen your profile
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {data.suggestions.gapAnalysis.map((gap, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50/50 rounded-lg">
                      <TrendingDown className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-900">{gap}</p>
                        <p className="text-xs text-orange-700 mt-1">
                          Recruiters often look for this in your target role
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-orange-100/50 rounded-lg">
                  <p className="text-sm text-orange-800">
                    💡 <strong>Coach's tip:</strong> These aren't deal-breakers! Consider mentioning relevant coursework, projects, or transferable experience that shows your potential in these areas.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Card 3: Actionable Improvements - Collapsed by Default */}
        <Collapsible open={expandedSections.improvements} onOpenChange={() => toggleSection('improvements')}>
          <Card className="border-l-4 border-l-blue-500">
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-base">Actionable Improvements</CardTitle>
                  </div>
                  {expandedSections.improvements ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <CardDescription>
                  Recruiter-focused tips to make your profile stand out
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {data.suggestions.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg">
                      <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">{improvement}</p>
                        <p className="text-xs text-blue-700 mt-1">
                          This helps recruiters quickly see your impact
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-100/50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ✨ <strong>Pro tip:</strong> Recruiters spend about 6 seconds scanning a profile. These changes help them immediately understand your value.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Selection Summary & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Ready to Apply ({selectedCount} sections selected)
          </CardTitle>
          <CardDescription>
            Choose which sections to add to your profile. You can always edit these later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Selection Checkboxes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="personalInfo"
                checked={selections.personalInfo}
                onCheckedChange={() => handleSectionToggle('personalInfo')}
              />
              <label htmlFor="personalInfo" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Info
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="skills"
                checked={selections.skills}
                onCheckedChange={() => handleSectionToggle('skills')}
              />
              <label htmlFor="skills" className="text-sm font-medium flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Skills ({data.extractedData.skills.length})
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="experience"
                checked={selections.experience}
                onCheckedChange={() => handleSectionToggle('experience')}
              />
              <label htmlFor="experience" className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Experience ({data.extractedData.experience.length})
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="education"
                checked={selections.education}
                onCheckedChange={() => handleSectionToggle('education')}
              />
              <label htmlFor="education" className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Education ({data.extractedData.education.length})
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={handleApplyAll}
          className="flex-1"
          disabled={selectedCount === 0}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Apply Selected Sections ({selectedCount})
        </Button>
        <Button variant="outline" onClick={onSkip}>
          Skip for Now
        </Button>
        {onRetry && (
          <Button variant="ghost" onClick={onRetry} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}