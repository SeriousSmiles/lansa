
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { useUserType } from "@/hooks/useUserType";

interface UserProfileProps {
  userName: string;
  email: string;
  handleLogout: () => Promise<void>;
  themeColor?: string;
}

export function UserProfile({ userName, email, handleLogout, themeColor }: UserProfileProps) {
  const { user } = useAuth();
  const { userType } = useUserType();
  const [profileImage, setProfileImage] = useState<string>("");

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
    <DropdownMenu modal>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Avatar className="h-10 w-10">
            {profileImage ? (
              <AvatarImage src={profileImage} alt={`${userName} avatar`} />
            ) : (
              <AvatarFallback
                className="text-white font-bold"
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
        className="w-56"
        onCloseAutoFocus={(e) => e.preventDefault()}
        loop
      >
        <div className="px-3 py-2">
          <p className="text-sm font-medium leading-none">{userName}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
        <DropdownMenuSeparator />
        {userType !== 'employer' && (
          <DropdownMenuItem asChild>
            <Link to="/profile">Resume Builder</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={safeHandler(() => {}, "Settings")}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
