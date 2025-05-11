
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarGroupContent
} from "@/components/ui/sidebar";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, Home, BookOpen, Video, User, HelpCircle, Settings, MoreHorizontal } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  email: string;
}

export function DashboardLayout({ children, userName, email }: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Resources",
      url: "/resources",
      icon: BookOpen,
    },
    {
      title: "Content Library",
      url: "/content",
      icon: Video,
    },
    {
      title: "My Profile",
      url: "/profile",
      icon: User,
    }
  ];

  const footerItems = [
    {
      title: "Support",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[rgba(253,248,242,1)]">
        <Sidebar>
          <SidebarHeader className="gap-4 pt-6 lg:gap-6 lg:pt-0">
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
          
          <SidebarContent className="mt-4 lg:mt-6">
            <SidebarGroup>
              <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url} className="flex w-full items-center gap-3">
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="flex flex-col gap-4 pb-6 lg:gap-6 lg:pb-0">
            <SidebarSeparator />
            <div>
              <SidebarMenu>
                {footerItems.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className="flex w-full items-center gap-3">
                        <item.icon className="size-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
            <SidebarSeparator />
            <div className="flex items-center justify-between px-2">
              <div className="grid grid-cols-[max-content_1fr] items-center gap-3">
                <div className="w-10 h-10 bg-[#FF6B4A] rounded-full flex items-center justify-center text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile</Link>
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
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1">
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
          <div className="container mx-auto pt-0 md:pt-0">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
