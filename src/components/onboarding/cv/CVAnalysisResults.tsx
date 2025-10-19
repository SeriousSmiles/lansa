import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  RefreshCw,
  FileText,
  Award,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

interface CVAnalysisResultsProps {
  data: {
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
    matchAnalysis?: {
      alignmentScore: number;
      skillAlignment?: {
        score: number;
        matches: string[];
        missing: string[];
        insight: string;
      };
      goalAlignment?: {
        score: number;
        supports: string[];
        gaps: string[];
        insight: string;
      };
      experienceAlignment?: {
        score: number;
        relevant: string[];
        stretches: string[];
        insight: string;
      };
      recommendations: string[];
      summary: string;
    };
  };
  onApply: (selectedData: any) => void;
  onSkip: () => void;
  fileName?: string;
}

interface SectionSelection {
  personalInfo: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
}

export function CVAnalysisResults({ 
  data, 
  onApply, 
  onSkip, 
  fileName
}: CVAnalysisResultsProps) {
  const [selections, setSelections] = useState<SectionSelection>({
    personalInfo: true,
    skills: true,
    experience: true,
    education: true,
  });
  
  const [expandedSections, setExpandedSections] = useState({
    extracted: true,
    gaps: false,
    improvements: false,
    details: false
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

  const handleApplySelected = () => {
    const selectedData: any = {};
    
    if (selections.personalInfo) {
      selectedData.personalInfo = {
        name: data.extractedData.name,
        title: data.extractedData.title,
        summary: data.extractedData.summary,
        ...data.extractedData.contact
      };
    }
    if (selections.skills) {
      selectedData.skills = data.extractedData.skills || [];
    }
    if (selections.experience) {
      selectedData.experience = data.extractedData.experience || [];
    }
    if (selections.education) {
      selectedData.education = data.extractedData.education || [];
    }

    onApply(selectedData);
  };

  const selectedCount = Object.values(selections).filter(Boolean).length;
  const confidence = Math.round(data.suggestions.confidence);
  const hasContact = data.extractedData.contact && 
    (data.extractedData.contact.email || data.extractedData.contact.phone || data.extractedData.contact.location);

  const skillsCount = data.extractedData.skills?.length || 0;
  const experienceCount = data.extractedData.experience?.length || 0;
  const educationCount = data.extractedData.education?.length || 0;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4 pb-6 border-b">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-green-900">
            CV Analysis Complete!
          </h3>
          <p className="text-green-700">
            Successfully extracted data from <span className="font-medium">{fileName}</span>
          </p>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-green-600">
            <span>{skillsCount} skills</span>
            <span>•</span>
            <span>{experienceCount} experiences</span>
            <span>•</span>
            <span>{educationCount} education</span>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Extraction Quality: {confidence}%
                </CardTitle>
                <CardDescription>
                  {confidence >= 80 ? "Excellent extraction quality" : 
                   confidence >= 60 ? "Good extraction quality" : 
                   "Partial extraction - you may want to review and add missing details"}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{confidence}%</div>
              <Progress value={confidence} className="w-20 mt-1" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mismatch Warnings */}
      {data.suggestions.mismatchWarnings && data.suggestions.mismatchWarnings.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Areas to review:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {data.suggestions.mismatchWarnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Extracted Content Preview */}
      <Collapsible open={expandedSections.extracted} onOpenChange={() => toggleSection('extracted')}>
        <Card className="border-l-4 border-l-green-500">
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-green-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base">Extracted Information</CardTitle>
                </div>
                {expandedSections.extracted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
              <CardDescription>
                Review what we found in your CV - {skillsCount} skills detected
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              {/* Personal Information */}
              {(data.extractedData.name || data.extractedData.title || hasContact) && (
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h4>
                  <div className="bg-green-50/50 rounded-lg p-4 space-y-2">
                    {data.extractedData.name && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Name:</span>
                        <span>{data.extractedData.name}</span>
                      </div>
                    )}
                    {data.extractedData.title && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Title:</span>
                        <span>{data.extractedData.title}</span>
                      </div>
                    )}
                    {data.extractedData.contact?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{data.extractedData.contact.email}</span>
                      </div>
                    )}
                    {data.extractedData.contact?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{data.extractedData.contact.phone}</span>
                      </div>
                    )}
                    {data.extractedData.contact?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{data.extractedData.contact.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Professional Summary/Bio */}
              {data.extractedData.summary && (
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Professional Summary
                  </h4>
                  <div className="bg-green-50/50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {data.extractedData.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {skillsCount > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Skills ({skillsCount})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.extractedData.skills!.slice(0, 8).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">
                        {skill}
                      </Badge>
                    ))}
                    {skillsCount > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{skillsCount - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Experience */}
              {experienceCount > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Work Experience ({experienceCount})
                  </h4>
                  <div className="space-y-3">
                    {data.extractedData.experience!.map((exp, index) => (
                      <div key={index} className="bg-green-50/50 rounded-lg p-4">
                        <div className="font-medium">{exp.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {exp.company} • {exp.duration}
                        </div>
                        {exp.description && (
                          <div className="text-sm mt-2 text-gray-700">
                            {exp.description.substring(0, 150)}
                            {exp.description.length > 150 && '...'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {educationCount > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Education ({educationCount})
                  </h4>
                  <div className="space-y-2">
                    {data.extractedData.education!.map((edu, index) => (
                      <div key={index} className="bg-green-50/50 rounded-lg p-3">
                        <div className="font-medium">{edu.degree}</div>
                        <div className="text-sm text-muted-foreground">
                          {edu.institution} • {edu.year}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Gap Analysis */}
      {data.suggestions.gapAnalysis.length > 0 && (
        <Collapsible open={expandedSections.gaps} onOpenChange={() => toggleSection('gaps')}>
          <Card className="border-l-4 border-l-orange-500">
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-orange-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-base">Opportunities to Strengthen</CardTitle>
                  </div>
                  {expandedSections.gaps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <CardDescription>
                  {data.suggestions.gapAnalysis.length} areas to consider adding
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {data.suggestions.gapAnalysis.map((gap, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50/50 rounded-lg">
                      <TrendingDown className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-orange-900">{gap}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Match Analysis with Onboarding */}
      {data.matchAnalysis && (
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    CV Alignment with Your Goals
                  </CardTitle>
                  <CardDescription>
                    How well your CV matches what you told us during onboarding
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">
                  {data.matchAnalysis.alignmentScore}%
                </div>
                <div className="text-xs text-muted-foreground">Overall Match</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700 bg-purple-50/50 p-3 rounded-lg">
              {data.matchAnalysis.summary}
            </p>

            {/* Skill Alignment */}
            {data.matchAnalysis.skillAlignment && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-purple-600" />
                    Skill Alignment
                  </h4>
                  <Badge variant="secondary">{data.matchAnalysis.skillAlignment.score}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{data.matchAnalysis.skillAlignment.insight}</p>
                {data.matchAnalysis.skillAlignment.matches.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-green-700">Matching: </span>
                    <span className="text-xs text-gray-600">
                      {data.matchAnalysis.skillAlignment.matches.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Goal Alignment */}
            {data.matchAnalysis.goalAlignment && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    Goal Alignment
                  </h4>
                  <Badge variant="secondary">{data.matchAnalysis.goalAlignment.score}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{data.matchAnalysis.goalAlignment.insight}</p>
              </div>
            )}

            {/* Recommendations */}
            {data.matchAnalysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {data.matchAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs bg-purple-50/50 p-2 rounded">
                      <span className="text-purple-600 font-semibold">{index + 1}.</span>
                      <span className="text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {data.suggestions.improvements.length > 0 && (
        <Collapsible open={expandedSections.improvements} onOpenChange={() => toggleSection('improvements')}>
          <Card className="border-l-4 border-l-blue-500">
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-base">Suggested Improvements</CardTitle>
                  </div>
                  {expandedSections.improvements ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <CardDescription>
                  Ways to enhance your profile impact
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {data.suggestions.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg">
                      <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-900">{improvement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Choose What to Apply ({selectedCount} sections selected)
          </CardTitle>
          <CardDescription>
            Select which sections to add to your profile. You can edit everything later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="personalInfo"
                checked={selections.personalInfo}
                onCheckedChange={() => handleSectionToggle('personalInfo')}
              />
              <label htmlFor="personalInfo" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Personal Info
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="skills"
                checked={selections.skills}
                onCheckedChange={() => handleSectionToggle('skills')}
              />
              <label htmlFor="skills" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                <Wrench className="h-4 w-4" />
                Skills ({skillsCount})
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="experience"
                checked={selections.experience}
                onCheckedChange={() => handleSectionToggle('experience')}
              />
              <label htmlFor="experience" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                <Briefcase className="h-4 w-4" />
                Experience ({experienceCount})
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="education"
                checked={selections.education}
                onCheckedChange={() => handleSectionToggle('education')}
              />
              <label htmlFor="education" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                <GraduationCap className="h-4 w-4" />
                Education ({educationCount})
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Button 
          onClick={handleApplySelected}
          className="flex-1"
          disabled={selectedCount === 0}
          size="lg"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Apply to Profile ({selectedCount} sections)
        </Button>
        <Button variant="outline" onClick={onSkip} size="lg">
          Skip for Now
        </Button>
      </div>
    </div>
  );
}