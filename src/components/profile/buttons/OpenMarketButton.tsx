import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Trophy, Users, Briefcase, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface OpenMarketButtonProps {
  highlightColor?: string;
}

export function OpenMarketButton({ highlightColor = "#FF6B4A" }: OpenMarketButtonProps) {
  const [open, setOpen] = useState(false);

  const handleStartCertification = () => {
    toast.success("Certification process will be available soon!");
    setOpen(false);
  };

  const benefits = [
    {
      icon: Trophy,
      title: "Lansa Certified Badge",
      description: "Get verified and stand out with our official certification"
    },
    {
      icon: Users,
      title: "Discovery Catalogue",
      description: "Be discoverable by top companies and recruiters"
    },
    {
      icon: Briefcase,
      title: "Priority Matching",
      description: "Get priority access to exclusive job opportunities"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full mt-4"
          style={{ 
            backgroundColor: highlightColor,
            borderColor: highlightColor 
          }}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Open Market - Get Lansa Certified
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: highlightColor }} />
            Get Lansa Certified
          </DialogTitle>
          <DialogDescription>
            Join our certified talent catalogue and unlock exclusive opportunities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">What you'll get:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5" style={{ color: highlightColor }} />
                    <div>
                      <h4 className="font-medium text-sm">{benefit.title}</h4>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-dashed" style={{ borderColor: `${highlightColor}40` }}>
            <CardContent className="pt-6 text-center">
              <div className="space-y-3">
                <Badge variant="outline" style={{ color: highlightColor, borderColor: highlightColor }}>
                  Coming Soon
                </Badge>
                <div>
                  <h4 className="font-medium">Certification Process</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete our skills assessment and mini-project to get certified
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Maybe Later
            </Button>
            <Button 
              onClick={handleStartCertification}
              className="flex-1"
              style={{ 
                backgroundColor: highlightColor,
                borderColor: highlightColor 
              }}
            >
              Get Started
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}