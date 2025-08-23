import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Plus, GraduationCap, Calendar } from "lucide-react";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { SimpleEducationDialog } from "./SimpleEducationDialog";
import { StepContainer } from "./StepContainer";

interface EducationStepProps {
  profile: ProfileDataReturn;
  userId: string;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function EducationStep({ profile, onNext, onPrevious, isFirst, isLast }: EducationStepProps) {
  const [showForm, setShowForm] = useState(false);

  const hasEducation = !!(profile.educationItems && profile.educationItems.length > 0);
  const educationList = profile.educationItems || [];

  return (
    <StepContainer
      title="Add Your Education"
      description="Include your degrees, certifications, and relevant coursework"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirst={isFirst}
      isLast={isLast}
      isCompleted={hasEducation}
    >
      <div className="space-y-6">
        {/* Education List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Your Education
              </div>
              {hasEducation && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {educationList.length} entries
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {educationList.length > 0 ? (
              <div className="space-y-4">
                {educationList.map((edu, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{edu.title}</h4>
                        <p className="text-sm text-muted-foreground">{edu.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Education Entry
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No education added yet</p>
                  <p className="text-sm">Add your degrees, certifications, or relevant coursework</p>
                </div>
                <Button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Education
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education Form Dialog */}
        {showForm && (
          <SimpleEducationDialog
            open={showForm}
            onOpenChange={setShowForm}
            onSave={async (education) => {
              if (profile.addEducation) {
                await profile.addEducation(education);
              }
            }}
          />
        )}

        {/* Education Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Education Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2">🎓 This section is for your authentic education</h4>
                <p className="text-sm text-blue-800">
                  No AI assistance here - share your real educational background, certifications, 
                  and relevant learning experiences in your own words.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">What to Include:</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Degree type and major/field of study</li>
                    <li>• Institution name and location</li>
                    <li>• Graduation year or expected graduation</li>
                    <li>• Relevant coursework or specializations</li>
                    <li>• Professional certifications</li>
                    <li>• Academic achievements (honors, GPA if strong)</li>
                    <li>• Relevant online courses or bootcamps</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Writing Tips:</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• List in reverse chronological order</li>
                    <li>• Include relevant projects or thesis topics</li>
                    <li>• Mention any academic honors or recognition</li>
                    <li>• Add certifications with expiration dates</li>
                    <li>• Include continuing education efforts</li>
                    <li>• Keep descriptions relevant to your career goals</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h5 className="font-medium text-amber-900 mb-1">For Current Students:</h5>
                <p className="text-sm text-amber-800">
                  Include your expected graduation date, relevant coursework, academic projects, 
                  and any honors or leadership roles in student organizations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StepContainer>
  );
}