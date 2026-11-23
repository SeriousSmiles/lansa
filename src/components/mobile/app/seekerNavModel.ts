/** Maps any seeker path to exactly one bottom-tab id. */
export type SeekerTab = "home" | "feed" | "jobs" | "inbox" | "profile";

export function seekerTabFor(pathname: string): SeekerTab {
  if (pathname.startsWith("/feed")) return "feed";
  if (pathname.startsWith("/jobs") || pathname.startsWith("/discovery") || pathname.startsWith("/opportunity-discovery")) return "jobs";
  if (pathname.startsWith("/chat")) return "inbox";
  if (pathname.startsWith("/profile") || pathname === "/card") return "profile";
  return "home";
}
