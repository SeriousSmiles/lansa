import { Bookmark, BookmarkCheck, ExternalLink, Trash2 } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import type { CareerPost } from "@/services/careerFeedService";
import { categoryLabel, initials, linkHost } from "./careerFeedModel";

function when(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "recently" : `${formatDistanceToNowStrict(d)} ago`;
}

interface Props {
  post: CareerPost;
  saved: boolean;
  isOwner: boolean;
  busy?: boolean;
  expanded?: boolean;
  selected?: boolean;
  onOpen?: () => void;
  onToggleSave: () => void;
  onDelete?: () => void;
}

export function FeedPostCard({ post, saved, isOwner, busy, expanded, selected, onOpen, onToggleSave, onDelete }: Props) {
  const name = post.author_name || "LANSA member";
  return (
    <article className={`sk-post ee-fade ${selected ? "is-selected" : ""}`} aria-labelledby={`post-${post.id}-author`}>
      <header className="sk-post-head">
        <span className="sk-avatar" aria-hidden>{initials(post.author_name)}</span>
        <span className="min-w-0 flex-1">
          <span id={`post-${post.id}-author`} className="sk-post-author">{name}{isOwner && <span className="sk-you">You</span>}</span>
          <span className="sk-post-meta">{[post.author_title, when(post.created_at)].filter(Boolean).join(" · ")}</span>
        </span>
      </header>
      <span className="ee-status self-start">{categoryLabel(post.category)}</span>

      {onOpen && !expanded ? (
        <button type="button" className="sk-post-open" onClick={onOpen} aria-label={`Open ${post.title || "update"} by ${name}`}>
          {post.title && <span className="sk-post-title">{post.title}</span>}
          <span className="sk-post-body is-clamped">{post.body}</span>
        </button>
      ) : (
        <div className="sk-post-open">
          {post.title && <h2 className="sk-post-title">{post.title}</h2>}
          <p className="sk-post-body">{post.body}</p>
        </div>
      )}

      {post.work_url && (
        <a className="sk-work" href={post.work_url} target="_blank" rel="noopener noreferrer nofollow">
          <span className="sk-work-icon" aria-hidden><ExternalLink size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="sk-work-title">{post.title || "View work"}</span>
            <span className="sk-work-host">{linkHost(post.work_url)}</span>
          </span>
        </a>
      )}

      <footer className="sk-post-actions">
        <button type="button" className="sk-action" aria-pressed={saved} disabled={busy} onClick={onToggleSave}>
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          {saved ? "Saved" : "Save"}
        </button>
        {isOwner && onDelete && (
          <button type="button" className="sk-action is-danger" disabled={busy} onClick={onDelete}>
            <Trash2 size={18} /> Delete
          </button>
        )}
      </footer>
    </article>
  );
}
