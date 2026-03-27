import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import AnimatedLogo from "@/components/AnimatedLogo";
import { Lock } from "lucide-react";

interface AccessGateProps {
  onUnlock: () => void;
}

export function AccessGate({ onUnlock }: AccessGateProps) {
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("lansa-b2b-unlocked") === "true") {
      onUnlock();
    }
  }, [onUnlock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phrase.toLowerCase().trim() === "get candidates") {
      sessionStorage.setItem("lansa-b2b-unlocked", "true");
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[hsl(215,85%,12%)] via-[hsl(215,85%,18%)] to-[hsl(215,70%,8%)]">
      <div className="flex flex-col items-center gap-8 px-6 max-w-md w-full">
        <AnimatedLogo size={80} />
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white font-['Urbanist']">
            LANSA FOR BUSINESS
          </h1>
          <p className="text-white/60 text-sm">
            Enter the access phrase to view this proposal
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Enter access phrase..."
              error={error}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-[hsl(var(--lansa-blue))]"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-center text-sm text-red-400 animate-in fade-in">
              Incorrect phrase. Please try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full h-12 rounded-md bg-[hsl(var(--lansa-orange))] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Unlock Proposal
          </button>
        </form>
        <p className="text-white/30 text-xs">
          This document is confidential and intended for authorized recipients only.
        </p>
      </div>
    </div>
  );
}
