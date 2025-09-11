import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobPreviewProps {
  title: string;
  description: string;
  location: string;
  mode: string;
  skills: string[];
  imageUrl?: string;
  companyName?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function JobPreview({ 
  title, 
  description, 
  location, 
  mode, 
  skills, 
  imageUrl, 
  companyName,
  isCollapsed,
  onToggleCollapse 
}: JobPreviewProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Job Preview</CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
            {isCollapsed ? "Expand" : "Collapse"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrl && (
          <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
            <img src={imageUrl} alt="Job image" className="w-full h-full object-cover" />
          </div>
        )}
        
        <div>
          <h3 className="font-semibold text-lg">{title || "Job Title"}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Building2 className="h-4 w-4" />
            <span>{companyName || "Company Name"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location || "Location"}</span>
          <Badge variant="secondary">{mode || "Remote"}</Badge>
        </div>

        {!isCollapsed && (
          <>
            <div>
              <p className="text-sm text-muted-foreground">
                {description || "Job description will appear here..."}
              </p>
            </div>

            {skills.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}