import { supabase } from "@/integrations/supabase/client";
import type { FeedCategory, FeedFilter, PostDraft } from "@/components/feed/careerFeedModel";

export interface CareerPost {
  id: string;
  author_id: string;
  category: FeedCategory;
  title: string | null;
  body: string;
  work_url: string | null;
  author_name: string | null;
  author_title: string | null;
  created_at: string;
}

// The generated database types lag behind new tables; keep the untyped client local to this service.
const db = supabase as any;
const COLS = "id,author_id,category,title,body,work_url,author_name,author_title,created_at";

export const careerFeedService = {
  async list(filter: FeedFilter, userId: string, limit = 40): Promise<CareerPost[]> {
    if (filter === "saved") {
      const { data, error } = await db.from("career_post_bookmarks").select(`created_at, post:career_posts(${COLS})`).eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
      if (error) throw error;
      return (data || []).map((r: any) => r.post).filter(Boolean);
    }
    let q = db.from("career_posts").select(COLS).order("created_at", { ascending: false }).limit(limit);
    if (filter !== "all") q = q.eq("category", filter);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },
  async get(id: string): Promise<CareerPost | null> {
    const { data, error } = await db.from("career_posts").select(COLS).eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async byAuthor(authorId: string): Promise<CareerPost[]> {
    const { data, error } = await db.from("career_posts").select(COLS).eq("author_id", authorId).order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return data || [];
  },
  async create(draft: PostDraft): Promise<CareerPost> {
    const { data, error } = await db.from("career_posts").insert({ category: draft.category, title: draft.title ?? null, body: draft.body, work_url: draft.work_url ?? null }).select(COLS).single();
    if (error) throw error;
    return data;
  },
  async remove(id: string): Promise<void> {
    const { error } = await db.from("career_posts").delete().eq("id", id);
    if (error) throw error;
  },
  async savedIds(userId: string): Promise<Set<string>> {
    const { data, error } = await db.from("career_post_bookmarks").select("post_id").eq("user_id", userId);
    if (error) throw error;
    return new Set((data || []).map((r: any) => r.post_id));
  },
  async setSaved(userId: string, postId: string, saved: boolean): Promise<void> {
    const { error } = saved
      ? await db.from("career_post_bookmarks").insert({ user_id: userId, post_id: postId })
      : await db.from("career_post_bookmarks").delete().eq("user_id", userId).eq("post_id", postId);
    if (error && error.code !== "23505") throw error;
  },
};
