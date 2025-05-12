
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarHeader } from "@/components/ui/sidebar";

export function DashboardSidebarHeader() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SidebarHeader className="gap-4 pt-6 pb-6 lg:gap-6 lg:pt-6">
      <Link to="/dashboard">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
          alt="Lansa Logo"
          className="aspect-[2.7] object-contain w-[92px]"
        />
      </Link>
      <div className="relative w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-full h-9"
        />
      </div>
    </SidebarHeader>
  );
}
