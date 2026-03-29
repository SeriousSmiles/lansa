import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import lansaLogo from "@/assets/lansa-logo-blue.png";

export const LandingNavbar = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Business", href: "/for-business" },
  ];

  const scrollOrNavigate = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-[5%] py-3">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <img src={lansaLogo} alt="Lansa" className="h-7" />
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => scrollOrNavigate(l.href)}
              className="text-sm font-public-sans text-foreground/70 hover:text-foreground transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="font-urbanist">
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate("/signup")} className="font-urbanist">
            Get Started
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="flex flex-col gap-3 px-[5%] py-4">
              {links.map((l) => (
                <button
                  key={l.label}
                  onClick={() => scrollOrNavigate(l.href)}
                  className="text-left text-sm font-public-sans text-foreground/70 py-2"
                >
                  {l.label}
                </button>
              ))}
              <hr className="border-border" />
              <Button variant="ghost" size="sm" onClick={() => { setMobileOpen(false); navigate("/login"); }} className="justify-start font-urbanist">
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={() => { setMobileOpen(false); navigate("/signup"); }} className="font-urbanist">
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
