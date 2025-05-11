
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileHeaderProps {
  userName: string;
  role: string;
  user: any;
}

export function ProfileHeader({ userName, role, user }: ProfileHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <header className="flex min-h-[72px] w-full px-4 md:px-16 items-center shadow-sm bg-white">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate("/dashboard")}
        className="mr-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
        alt="Lansa Logo"
        className="aspect-[2.7] object-contain w-[92px]"
      />
    </header>
  );
}
