
import React from "react";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileHeader() {
  return (
    <div className="flex md:hidden min-h-16 items-center justify-between border-b bg-background px-4">
      <Link to="/dashboard">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
          alt="Lansa Logo"
          className="aspect-[2.7] object-contain w-[92px]"
        />
      </Link>
      <SidebarTrigger />
    </div>
  );
}
