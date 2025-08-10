import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const studyOptions = [
  "Hospitality Management",
  "Information Technology",
  "Creative Media",
  "Business & Entrepreneurship",
  "Environmental Science"
];

const realWorldOptions = [
  "Create unique travel experiences",
  "Build helpful student apps",
  "Design meaningful visual stories",
  "Launch a campus mini-venture",
  "Advance sustainable solutions"
];

export default function OnboardingStudent() {
  const [step, setStep] = useState(1);
  const [study, setStudy] = useState<string>("Hospitality Management");
  const [realWorld, setRealWorld] = useState<string>("Create unique travel experiences");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Onboarding – Student Focus";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Two quick questions to personalize your student journey.");
  }, []);

  const next = () => {
    if (step === 1) {
      setStep(2);
    } else {
      const answers = { study_field: study, real_world_use: realWorld, onboarding_completed: true };
      localStorage.setItem("prototype_answers", JSON.stringify(answers));
      navigate("/profile-starter");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="max-w-5xl mx-auto px-6 pt-10">
        <h1 className="text-3xl font-bold tracking-tight">Your path, clarified in minutes</h1>
        <p className="text-muted-foreground mt-2">Your answers today shape your tomorrow.</p>
      </header>
      <section className="max-w-xl mx-auto px-6 py-10">
        <Card className="animate-scale-in">
          <CardContent className="p-6 space-y-5">
            <div className="text-sm text-muted-foreground">Step {step} of 2</div>
            {step === 1 ? (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">What are you studying?</h2>
                <Select value={study} onValueChange={setStudy}>
                  <SelectTrigger aria-label="study field">
                    <SelectValue placeholder="Choose your field" />
                  </SelectTrigger>
                  <SelectContent>
                    {studyOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">How do you want to use it in the real world?</h2>
                <Select value={realWorld} onValueChange={setRealWorld}>
                  <SelectTrigger aria-label="real world use">
                    <SelectValue placeholder="Choose your direction" />
                  </SelectTrigger>
                  <SelectContent>
                    {realWorldOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="pt-2">
              <Button className="w-full" onClick={next}>{step === 1 ? 'Continue' : 'Create my starter'}</Button>
            </div>
          </CardContent>
        </Card>
        <link rel="canonical" href={window.location.href} />
      </section>
    </main>
  );
}
