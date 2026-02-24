
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
import { useUserState } from "@/contexts/UserStateProvider";

interface UserProfileProps {
  userName: string;
  email: string;
  handleLogout: () => Promise<void>;
  themeColor?: string;
}

export function UserProfile({ userName, email, handleLogout, themeColor }: UserProfileProps) {
  const { user } = useAuth();
  const { userType } = useUserState();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Compute display name with proper fallback chain
  const displayName = userName?.trim() || user?.email?.split('@')[0] || 'User';
  const displayInitial = displayName.charAt(0).toUpperCase();

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
          <Avatar className="h-10 w-10">
            {profileImage ? (
              <AvatarImage src={profileImage} alt={`${displayName} avatar`} />
            ) : (
              <AvatarFallback
                className="text-white font-bold text-lg"
                style={{ backgroundColor: themeColor || "#FF6B4A" }}
              >
                {displayInitial}
              </AvatarFallback>
            )}
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-popover border border-border z-[200]"
        onCloseAutoFocus={(e) => e.preventDefault()}
        loop
      >
        <div className="px-3 py-2">
          <p className="text-sm font-medium leading-none">{displayName}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
        <DropdownMenuSeparator />
        {userType !== 'employer' && (
          <DropdownMenuItem onSelect={() => {
            setIsMenuOpen(false);
            navigate("/profile");
          }}>
            Resume Builder
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => {
          setIsMenuOpen(false);
          navigate("/resources");
        }}>
          Resources
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => {
          setIsMenuOpen(false);
          navigate(userType === 'employer' ? '/organization/settings' : '/settings');
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
