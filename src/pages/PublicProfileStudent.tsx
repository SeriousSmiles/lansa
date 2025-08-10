import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export default function PublicProfileStudent() {
  const { userId } = useParams();
  const stored = localStorage.getItem("prototype_profile");
  const profile = stored ? JSON.parse(stored) : {
    name: "Student Name",
    headline: "Hospitality Student | Creating Unique Travel Experiences",
    summary: "Motivated student exploring customer experience and sustainable tourism.",
    skills: ["Communication", "Problem Solving", "Event Planning"],
    projects: [
      { title: "Organized campus charity event – raised $5,000" },
      { title: "Designed hotel check-in simulation" }
    ]
  };

  useEffect(() => {
    document.title = `${profile.name} – Public Profile`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", `${profile.name} public student profile with projects.`);
  }, [profile.name]);

  return (
    <main className="min-h-screen bg-background">
      <article className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{profile.name}</h1>
        <p className="text-primary font-medium mb-4">{profile.headline}</p>
        <p className="text-muted-foreground mb-6">{profile.summary}</p>
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs">Open to internships & volunteer projects</span>
        </div>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Projects & Proof</h2>
          {profile.projects.map((p: any, i: number) => (
            <Card key={i}>
              <CardContent className="p-4 text-sm">{p.title}</CardContent>
            </Card>
          ))}
        </section>
        <div className="mt-8">
          <a href="#" className="underline text-sm">Contact for Opportunities</a>
          <div className="mt-4 flex gap-4 opacity-70">
            <span>in</span><span>IG</span><span>FB</span>
          </div>
        </div>
        <link rel="canonical" href={window.location.href} />
      </article>
    </main>
  );
}
