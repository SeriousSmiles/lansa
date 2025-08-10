import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function IndexPage() {
  const [name, setName] = useState("Student Name");
  const [email, setEmail] = useState("student@example.com");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Lansa – Start Building Your Future";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Login-free prototype: Start building your future in 15 minutes.");
  }, []);

  const start = () => {
    localStorage.setItem("prototype_user", JSON.stringify({ id: "demo-user", name, email }));
    localStorage.setItem("userName", name);
    navigate("/onboarding");
  };

  return (
    <AuthLayout imageSrc="/lovable-uploads/91347dc5-2857-4d8f-9a0e-f7f93f5a739b.png">
      <header className="w-full text-center">
        <h1 className="text-5xl tracking-tight leading-tight">Start Building Your Future in 15 Minutes</h1>
        <p className="mt-4 text-muted-foreground">Prototype mode – no sign up required.</p>
      </header>
      <div className="w-full max-w-md mx-auto mt-8 space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Your name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Email (for demo)</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button className="w-full" onClick={start}>Continue</Button>
      </div>
      <link rel="canonical" href={window.location.href} />
    </AuthLayout>
  );
}
