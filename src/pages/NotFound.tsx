import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IllustratedEmpty } from "@/components/common/Illustration";
import lansaLogo from "@/assets/lansa-logo-blue.png";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="seeker-theme min-h-screen bg-background flex flex-col">
      <header className="px-6 md:px-10 h-16 flex items-center">
        <Link to="/" aria-label="Lansa home"><img src={lansaLogo} alt="Lansa" className="h-7 w-auto" /></Link>
      </header>
      <main className="flex-1 grid place-items-center px-4 pb-16">
        <IllustratedEmpty art="lost" size={220} title="This page took a different road"
          body="The link may be old or mistyped. Let's get you back to familiar ground."
          action={<Button asChild size="lg" className="rounded-full px-8"><Link to="/">Back to home</Link></Button>} />
      </main>
    </div>
  );
};

export default NotFound;
