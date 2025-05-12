
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ProfileNotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[rgba(253,248,242,1)] flex flex-col items-center justify-center">
      <div className="text-2xl text-[#2E2E2E] mb-4">Profile not found</div>
      <Button onClick={() => navigate("/auth")}>Return to Login</Button>
    </div>
  );
}
