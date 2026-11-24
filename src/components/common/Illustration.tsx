import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import feed from "@/assets/illustrations/feed.webp";
import jobs from "@/assets/illustrations/jobs.webp";
import inbox from "@/assets/illustrations/inbox.webp";
import hiring from "@/assets/illustrations/hiring.webp";
import notifications from "@/assets/illustrations/notifications.webp";
import learning from "@/assets/illustrations/learning.webp";
import lost from "@/assets/illustrations/lost.webp";
import welcome from "@/assets/illustrations/welcome.webp";

/** Painted, people-first LANSA illustrations. One entry per moment. */
export const ILLUSTRATIONS = { feed, jobs, inbox, hiring, notifications, learning, lost, welcome } as const;
export type IllustrationName = keyof typeof ILLUSTRATIONS;

export function Illustration({ name, className, size = 168 }: { name: IllustrationName; className?: string; size?: number }) {
  return (
    <img src={ILLUSTRATIONS[name]} alt="" aria-hidden="true" width={size} height={size} loading="lazy" decoding="async"
      className={cn("lx-illustration", className)} style={{ width: size, height: size }} />
  );
}

/** Meetup / GetYourGuide style empty state: one warm picture, one sentence, one action. */
export function IllustratedEmpty({ art, title, body, action, className, size }: { art: IllustrationName; title: string; body?: ReactNode; action?: ReactNode; className?: string; size?: number }) {
  return (
    <div className={cn("lx-empty", className)}>
      <Illustration name={art} size={size} />
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action && <div className="lx-empty-action">{action}</div>}
    </div>
  );
}
