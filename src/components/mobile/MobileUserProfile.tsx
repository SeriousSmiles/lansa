import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { safeHandler } from "@/config/demo";

interface MobileUserProfileProps {
  userName: string;
  email: string;
  handleLogout: () => Promise<void>;
  themeColor?: string;
}

export function MobileUserProfile({ userName, email, handleLogout, themeColor }: MobileUserProfileProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("user_profiles")
        .select("profile_image")
        .eq("user_id", user.id)
        .single();
      if (!error && data?.profile_image && isMounted) {
        setProfileImage(data.profile_image);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <DropdownMenu modal open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Avatar className="h-9 w-9">
            {profileImage ? (
              <AvatarImage src={profileImage} alt={`${userName} avatar`} />
            ) : (
              <AvatarFallback
                className="text-white font-bold text-sm"
                style={{ backgroundColor: themeColor || "#FF6B4A" }}
              >
                {userName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-background border shadow-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
        loop
      >
        <div className="px-3 py-2">
          <p className="text-sm font-medium leading-none">{userName}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => {
          setIsMenuOpen(false);
          navigate("/profile");
        }}>
          Resume Builder
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => {
          setIsMenuOpen(false);
          safeHandler(() => {}, "Settings")();
        }}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          setIsMenuOpen(false);
          handleLogout();
        }}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}