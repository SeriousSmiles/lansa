import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CertificationTeaserBanner() {
  const navigate = useNavigate();

  return (
    <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold mb-2">Unlock the Full Job Feed</h3>
          <p className="text-muted-foreground max-w-2xl">
            You've seen a preview of available opportunities. Complete your Lansa certification 
            to access hundreds of jobs, personalized recommendations, and direct connections with employers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button 
            size="lg" 
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <Award className="w-5 h-5" />
            Start Certification Program
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Learn More
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-sm">
          <div className="p-3 bg-background rounded-lg border">
            <p className="font-semibold mb-1">📈 Personalized Feed</p>
            <p className="text-xs text-muted-foreground">
              AI-powered job recommendations based on your skills
            </p>
          </div>
          <div className="p-3 bg-background rounded-lg border">
            <p className="font-semibold mb-1">💼 Direct Applications</p>
            <p className="text-xs text-muted-foreground">
              Apply instantly and track your application status
            </p>
          </div>
          <div className="p-3 bg-background rounded-lg border">
            <p className="font-semibold mb-1">🤝 Employer Connections</p>
            <p className="text-xs text-muted-foreground">
              Chat directly with hiring managers
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
