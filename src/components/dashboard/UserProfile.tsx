
import React from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface UserProfileProps {
  userName: string;
  email: string;
  handleLogout: () => Promise<void>;
  themeColor?: string;
}

export function UserProfile({ userName, email, handleLogout, themeColor }: UserProfileProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid grid-cols-[max-content_1fr] items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: themeColor || "#FF6B4A" }}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-8 w-8"
            style={themeColor ? { color: themeColor } : {}}
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/profile">Resume Builder</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
