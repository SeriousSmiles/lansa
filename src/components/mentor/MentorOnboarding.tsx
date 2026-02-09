import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMentorProfile } from "@/hooks/useMentorProfile";
import { useCreateMentorSubscription, TIER_CONFIG, type SubscriptionTier } from "@/hooks/useMentorSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, Crown, Star, Zap, ArrowRight, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MentorOnboardingProps {
  onComplete: () => void;
}

export function MentorOnboarding({ onComplete }: MentorOnboardingProps) {
  const { user } = useAuth();
  const createProfile = useCreateMentorProfile();
  const createSubscription = useCreateMentorSubscription();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [mentorType, setMentorType] = useState<"teacher" | "coach" | "organization">("teacher");

  // Step 2 field
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("free");

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleComplete = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      // Create mentor profile
      await createProfile.mutateAsync({
        user_id: user.id,
        display_name: displayName,
        bio: bio || undefined,
        mentor_type: mentorType,
      });

      // Create subscription
      await createSubscription.mutateAsync({
        user_id: user.id,
        tier: selectedTier,
        price_xcg: TIER_CONFIG[selectedTier].price,
      });

      // Save user_type as 'mentor' in user_answers
      await supabase.from("user_answers").upsert({
        user_id: user.id,
        user_type: "mentor",
      }, { onConflict: "user_id" });

      // Mark onboarding complete
      await supabase.from("user_profiles").update({
        onboarding_completed: true,
      }).eq("user_id", user.id);

      toast.success("Welcome to Lansa as a Mentor!");
      onComplete();
    } catch (error: any) {
      toast.error("Failed to complete setup: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tierOptions = [
    { key: "free" as const, icon: Zap, ...TIER_CONFIG.free },
    { key: "starter" as const, icon: Star, ...TIER_CONFIG.starter },
    { key: "pro" as const, icon: Crown, ...TIER_CONFIG.pro },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <GraduationCap className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Set Up Your Mentor Profile</h1>
          <p className="text-muted-foreground mt-1">Step {step} of 2</p>
          {/* Progress */}
          <div className="flex gap-2 justify-center mt-3">
            <div className={cn("h-1.5 w-16 rounded-full", step >= 1 ? "bg-primary" : "bg-muted")} />
            <div className={cn("h-1.5 w-16 rounded-full", step >= 2 ? "bg-primary" : "bg-muted")} />
          </div>
        </div>

        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <Label>Display Name *</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How learners will see you"
                    required
                  />
                </div>
                <div>
                  <Label>What type of mentor are you?</Label>
                  <Select value={mentorType} onValueChange={(v) => setMentorType(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share your expertise and what you teach..."
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full gap-1">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tierOptions.map((tier) => {
                  const isSelected = selectedTier === tier.key;
                  return (
                    <button
                      key={tier.key}
                      type="button"
                      onClick={() => setSelectedTier(tier.key)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <tier.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{tier.label}</span>
                          <span className="font-bold">
                            {tier.price === 0 ? "Free" : `XCG ${tier.price}/mo`}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tier.maxVideos === Infinity ? "Unlimited" : tier.maxVideos} video{tier.maxVideos !== 1 ? "s" : ""}
                          {tier.externalLink ? " • External link" : ""}
                          {tier.promoted ? " • Featured placement" : ""}
                        </p>
                      </div>
                      {isSelected && <Check className="h-5 w-5 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Button
              onClick={handleComplete}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Complete Setup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
