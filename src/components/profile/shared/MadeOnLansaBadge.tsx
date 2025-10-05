import { Link } from "react-router-dom";
import lansaIcon from "@/assets/lansa-icon.svg";

// Easy configuration: Change this URL to point to your marketing website later
const BADGE_LINK_URL = "/auth";

export function MadeOnLansaBadge() {
  return (
    <Link
      to={BADGE_LINK_URL}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-200"
    >
      <img 
        src={lansaIcon} 
        alt="Lansa Icon" 
        className="w-5 h-5"
      />
      <span className="text-sm font-medium text-[#1A1F71]">
        Made on Lansa
      </span>
    </Link>
  );
}
