import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function useStarterData() {
  const user = useMemo(() => {
    const raw = localStorage.getItem("prototype_user");
    return raw ? JSON.parse(raw) : { id: "demo-user", name: "Student Name" };
  }, []);
  const answers = useMemo(() => {
    const raw = localStorage.getItem("prototype_answers");
    return raw ? JSON.parse(raw) : { study_field: "Hospitality Management", real_world_use: "Create unique travel experiences" };
  }, []);
  return { user, answers };
}

function generateHeadline(study: string, usage: string) {
  return `${study} Student | ${usage}`;
}

function generateSummary(study: string, usage: string) {
  return `A motivated ${study.toLowerCase()} student focused on ${usage.toLowerCase()}, building real-world readiness through projects and reflection.`;
}

export default function ProfileStarterStudent() {
  const navigate = useNavigate();
  const { user, answers } = useStarterData();

  useEffect(() => {
    document.title = "Your Profile Starter – Lansa";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Preview your generated student profile and market snapshot.");
  }, []);

  const headline = generateHeadline(answers.study_field, answers.real_world_use);
  const summary = generateSummary(answers.study_field, answers.real_world_use);

  return (
    <main className="min-h-screen bg-background">
      <section className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-8">
        <article>
          <h1 className="text-3xl font-bold tracking-tight mb-4">🎉 Your Profile Starter is Ready</h1>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <p className="text-primary font-medium mb-4">{headline}</p>
              <div className="flex gap-2 mb-4">
                <Badge variant="secondary">{answers.study_field}</Badge>
                <Badge variant="secondary">Growth-Focused</Badge>
              </div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground leading-relaxed">{summary}</p>
            </CardContent>
          </Card>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => navigate('/profile')}>Make This My Public Profile</Button>
            <Button variant="outline" onClick={() => window.open('/profile/share/demo-user', '_blank')}>Preview Public View</Button>
          </div>
        </article>

        <aside>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-3">Market Snapshot</h2>
              <div className="mb-4">
                <h3 className="font-medium mb-1">Top Trends</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Sustainable tourism</li>
                  <li>Digital concierge services</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="font-medium mb-1">Skills in Demand</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Communication</li>
                  <li>Problem-solving</li>
                  <li>Customer analytics</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-1">Example Roles</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Guest Experience Manager</li>
                  <li>Event Coordinator</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
      <link rel="canonical" href={window.location.href} />
    </main>
  );
}
