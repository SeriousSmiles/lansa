import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardStudent() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Lansa Dashboard – Student Next Steps";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Student dashboard with next steps, path to market, and story builder.");
  }, []);

  const steps = useMemo(() => [
    { label: "Clarify your focus", done: true },
    { label: "Gather proof (projects)", done: false },
    { label: "Share and get feedback", done: false },
  ], []);

  return (
    <main className="min-h-screen bg-background">
      <section className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Your Student Growth Dashboard</h1>
        <p className="text-muted-foreground mb-8">Practical steps to move toward internships, volunteer work, and early career opportunities.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-1">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Next Steps for Your Field</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3"><span className="mt-1 size-2 rounded-full bg-primary" />Interview someone working in your target role.</li>
                <li className="flex items-start gap-3"><span className="mt-1 size-2 rounded-full bg-primary" />Create a mini-project that solves a real problem (weekend scope).</li>
                <li className="flex items-start gap-3"><span className="mt-1 size-2 rounded-full bg-primary" />Ask 3 people for feedback on your profile summary.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Path to Market</h2>
              <ol className="space-y-3">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`size-4 rounded-full ${s.done ? 'bg-primary' : 'border'} `} />
                      <span className={s.done ? 'text-foreground' : 'text-muted-foreground'}>{s.label}</span>
                    </div>
                    {!s.done && (
                      <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                        Do this now
                      </Button>
                    )}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Story Builder</h2>
              <p className="text-sm text-muted-foreground mb-4">Use this prompt to outline a short story about a problem you solved or want to solve.</p>
              <div className="rounded-md bg-muted p-4 text-sm">
                "Describe a situation where your skills could improve a real experience for others. What was the challenge, what did you try, and what was the result or learning?"
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
