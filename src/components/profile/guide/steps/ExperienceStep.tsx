import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Plus, Briefcase, Calendar } from "lucide-react";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { SimpleExperienceDialog } from "./SimpleExperienceDialog";
import { StepContainer } from "./StepContainer";

interface ExperienceStepProps {
  profile: ProfileDataReturn;
  userId: string;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function ExperienceStep({ profile, onNext, onPrevious, isFirst, isLast }: ExperienceStepProps) {
  const [showForm, setShowForm] = useState(false);

  const hasExperience = !!(profile.experiences && profile.experiences.length > 0);
  const experienceList = profile.experiences || [];

  return (
    <StepContainer
      title="Add Your Experience"
      description="Share your work history, internships, and relevant projects"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirst={isFirst}
      isLast={isLast}
      isCompleted={hasExperience}
    >
      <div className="space-y-6">
        {/* Experience List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Your Experience
              </div>
              {hasExperience && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {experienceList.length} entries
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {experienceList.length > 0 ? (
              <div className="space-y-4">
                {experienceList.map((exp, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{exp.title}</h4>
                        <p className="text-sm text-muted-foreground">{exp.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {exp.startYear} - {exp.endYear || 'Present'}
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
                  Add Another Experience
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No experience added yet</p>
                  <p className="text-sm">Add your work history, internships, or relevant projects</p>
                </div>
                <Button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Experience
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experience Form Dialog */}
        {showForm && (
          <SimpleExperienceDialog
            open={showForm}
            onOpenChange={setShowForm}
            onSave={async (experience) => {
              if (profile.addExperience) {
                await profile.addExperience(experience);
              }
            }}
          />
        )}

        {/* Experience Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Experience Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2">📝 This section is for your authentic experience</h4>
                <p className="text-sm text-blue-800">
                  No AI assistance here - share your real work history, internships, volunteer work, 
                  or relevant projects in your own words.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">What to Include:</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Job titles and company names</li>
                    <li>• Key responsibilities and achievements</li>
                    <li>• Relevant skills you developed</li>
                    <li>• Quantifiable results when possible</li>
                    <li>• Internships and part-time work</li>
                    <li>• Significant volunteer experiences</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Writing Tips:</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Use action verbs (led, developed, improved)</li>
                    <li>• Include specific metrics where possible</li>
                    <li>• Focus on accomplishments, not just duties</li>
                    <li>• Tailor descriptions to your target roles</li>
                    <li>• Keep descriptions concise but informative</li>
                    <li>• List experiences in reverse chronological order</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StepContainer>
  );
}