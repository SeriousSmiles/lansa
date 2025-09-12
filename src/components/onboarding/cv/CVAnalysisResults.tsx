import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  ChevronUp
} from "lucide-react";
import { CVAnalysisData } from "./CVUploadModal";
import { cn } from "@/lib/utils";

interface CVAnalysisResultsProps {
  data: CVAnalysisData;
  onApply: (selectedData: Partial<CVAnalysisData['extractedData']>) => void;
  onSkip: () => void;
}

interface SectionSelection {
  personalInfo: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
}

export function CVAnalysisResults({ data, onApply, onSkip }: CVAnalysisResultsProps) {
  const [selections, setSelections] = useState<SectionSelection>({
    personalInfo: true,
    skills: true,
    experience: true,
    education: true,
  });
  const [showPreview, setShowPreview] = useState(false);

  const handleSectionToggle = (section: keyof SectionSelection) => {
    setSelections(prev => ({
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

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{data.suggestions.confidence}%</div>
            <p className="text-sm text-muted-foreground">Match Quality</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{data.extractedData.skills.length}</div>
            <p className="text-sm text-muted-foreground">Skills Found</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{data.suggestions.improvements.length}</div>
            <p className="text-sm text-muted-foreground">Improvements</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <div className="space-y-3">
        {/* Skills Match */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base">We matched {data.suggestions.skillMatches.length} skills</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1 mb-3">
              {data.suggestions.skillMatches.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-green-50 text-green-700">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Checkbox 
                id="skills"
                checked={selections.skills}
                onCheckedChange={() => handleSectionToggle('skills')}
              />
              <Button size="sm" variant="outline">
                Add to Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gap Analysis */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-base">We found gaps compared to your goals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 mb-3">
              {data.suggestions.gapAnalysis.map((gap, index) => (
                <p key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {gap}
                </p>
              ))}
            </div>
            <Button size="sm" variant="outline">
              See Fixes
            </Button>
          </CardContent>
        </Card>

        {/* Improvements */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">We found better power verbs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 mb-3">
              {data.suggestions.improvements.map((improvement, index) => (
                <p key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {improvement}
                </p>
              ))}
            </div>
            <Button size="sm" variant="outline">
              Upgrade Wording
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Select Data to Import</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Preview'}
              {showPreview ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
          </div>
          <CardDescription>
            Choose which sections to add to your profile ({selectedCount} selected)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Personal Info */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Checkbox 
                id="personalInfo"
                checked={selections.personalInfo}
                onCheckedChange={() => handleSectionToggle('personalInfo')}
              />
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Personal Information</p>
                <p className="text-sm text-muted-foreground">Name, title, summary</p>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Checkbox 
                id="experience"
                checked={selections.experience}
                onCheckedChange={() => handleSectionToggle('experience')}
              />
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Work Experience</p>
                <p className="text-sm text-muted-foreground">{data.extractedData.experience.length} positions</p>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Checkbox 
                id="education"
                checked={selections.education}
                onCheckedChange={() => handleSectionToggle('education')}
              />
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Education</p>
                <p className="text-sm text-muted-foreground">{data.extractedData.education.length} entries</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Checkbox 
                id="skills"
                checked={selections.skills}
                onCheckedChange={() => handleSectionToggle('skills')}
              />
              <Wrench className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Skills</p>
                <p className="text-sm text-muted-foreground">{data.extractedData.skills.length} skills identified</p>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
              {selections.personalInfo && (
                <div>
                  <h4 className="font-medium text-sm text-primary">Personal Info</h4>
                  <p className="text-sm">{data.extractedData.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{data.extractedData.summary}</p>
                </div>
              )}
              {selections.skills && (
                <div>
                  <h4 className="font-medium text-sm text-primary">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {data.extractedData.skills.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {data.extractedData.skills.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{data.extractedData.skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={handleApplyAll}
          className="flex-1"
          disabled={selectedCount === 0}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Apply Selected ({selectedCount})
        </Button>
        <Button variant="outline" onClick={onSkip}>
          Skip
        </Button>
      </div>
    </div>
  );
}