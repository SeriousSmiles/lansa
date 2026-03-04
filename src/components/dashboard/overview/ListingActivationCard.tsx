import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle2, Loader2, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function ListingActivationCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCertified, setIsCertified] = useState(false);
  const [isListed, setIsListed] = useState<boolean | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      // Check certification
      const { data: cert } = await supabase
        .from("user_certifications")
        .select("lansa_certified, verified")
        .eq("user_id", user.id)
        .single();

      if (!cert?.lansa_certified || !cert?.verified) {
        setIsLoading(false);
        return;
      }
      setIsCertified(true);

      // Get visible_to_employers from user_profiles
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("visible_to_employers, updated_at")
        .eq("user_id", user.id)
        .single();

      setIsListed(profile?.visible_to_employers ?? false);
      setUpdatedAt(profile?.updated_at ?? null);
      setIsLoading(false);
    };
    load();
  }, [user?.id]);

  const handleToggle = async () => {
    if (!user?.id || isToggling) return;
    setIsToggling(true);
    const newValue = !isListed;

    const { error } = await supabase
      .from("user_profiles")
      .update({ visible_to_employers: newValue })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Could not update listing status.", variant: "destructive" });
    } else {
      setIsListed(newValue);
      setUpdatedAt(new Date().toISOString());
      toast({
        title: newValue ? "You're now live!" : "Listing paused",
        description: newValue
          ? "Employers can now discover you in the browse feed."
          : "Your profile is hidden from the employer browse feed.",
      });
    }
    setIsToggling(false);
  };

  // Only render for certified users
  if (isLoading || !isCertified) return null;

  const listedDate = updatedAt ? format(new Date(updatedAt), "MMM d, yyyy") : null;

  if (isListed) {
    return (
      <Card className="border border-green-200/60 bg-gradient-to-r from-green-50/80 to-emerald-50/60 dark:from-green-950/30 dark:to-emerald-950/20 dark:border-green-800/40">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">Your Profile is Live</p>
                  <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-300/50 text-xs px-2 py-0">
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Employers can discover you in the browse feed.
                  {listedDate && <span className="ml-1">Active since {listedDate}.</span>}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggle}
              disabled={isToggling}
              className="border-green-300 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50 flex-shrink-0"
            >
              {isToggling ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 mr-1.5" />
              )}
              Pause Listing
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Activate Your Listing</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                You're certified. Start appearing to employers actively searching for talent.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleToggle}
            disabled={isToggling}
            className="flex-shrink-0"
          >
            {isToggling ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5 mr-1.5" />
            )}
            Go Live Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
