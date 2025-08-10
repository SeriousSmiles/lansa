import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function ProjectsAndProof({ projects, onChange }: { projects: string[]; onChange: (items: string[]) => void }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Projects & Proof</h3>
        <Button variant="outline" size="sm" onClick={() => onChange([...projects, "Untitled project"]) }>Add</Button>
      </div>
      <div className="space-y-3">
        {projects.map((p, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Input value={p} onChange={(e) => {
                const next = [...projects];
                next[i] = e.target.value;
                onChange(next);
              }} />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function ProfileStudent() {
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem("prototype_profile");
    return stored ? JSON.parse(stored) : {
      name: "Student Name",
      headline: "Hospitality Student | Creating Unique Travel Experiences",
      summary: "Motivated student exploring customer experience and sustainable tourism.",
      skills: ["Communication", "Problem Solving", "Event Planning"],
      projects: [
        "Organized campus charity event – raised $5,000",
        "Designed hotel check-in simulation"
      ]
    };
  });

  useEffect(() => {
    document.title = "Edit Profile – Lansa Student";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Edit your student profile: headline, summary, skills, and projects.");
  }, []);

  const save = () => {
    localStorage.setItem("prototype_profile", JSON.stringify(profile));
    toast.success("Changes saved!");
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-[2fr_1fr] gap-8">
        <article>
          <h1 className="text-3xl font-bold tracking-tight mb-6">Profile</h1>
          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Headline</label>
                <Input value={profile.headline} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Summary</label>
                <Textarea value={profile.summary} onChange={(e) => setProfile({ ...profile, summary: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s: string, i: number) => (
                    <Badge key={i} variant="secondary" className="cursor-text" onClick={() => {}}>{s}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={save}>Save</Button>
                <Button variant="outline" onClick={() => window.open("/profile/share/demo-user", "_blank")}>Preview Public</Button>
              </div>
            </CardContent>
          </Card>

          <ProjectsAndProof
            projects={profile.projects}
            onChange={(items) => setProfile({ ...profile, projects: items })}
          />
        </article>

        <aside>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Appearance</h3>
              <p className="text-sm text-muted-foreground mb-3">Choose a highlight color</p>
              <div className="flex gap-2">
                {['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'].map((c) => (
                  <button key={c} aria-label={`choose ${c}`} className="h-8 w-8 rounded-full border" style={{ backgroundColor: c }} onClick={() => setProfile({ ...profile, accent: c })} />
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
      <link rel="canonical" href={window.location.href} />
    </main>
  );
}
