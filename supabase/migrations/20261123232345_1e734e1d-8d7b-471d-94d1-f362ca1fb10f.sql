CREATE TABLE public.career_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid(),
  category text NOT NULL DEFAULT 'update',
  title text,
  body text NOT NULL,
  work_url text,
  author_name text,
  author_title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX career_posts_created_idx ON public.career_posts (created_at DESC);
CREATE INDEX career_posts_author_idx ON public.career_posts (author_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_posts TO authenticated;
GRANT ALL ON public.career_posts TO service_role;
ALTER TABLE public.career_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read career posts" ON public.career_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authors create own posts" ON public.career_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors update own posts" ON public.career_posts FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors delete own posts" ON public.career_posts FOR DELETE TO authenticated USING (author_id = auth.uid());

CREATE OR REPLACE FUNCTION public.prepare_career_post()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.author_id := OLD.author_id;
    NEW.created_at := OLD.created_at;
  END IF;
  NEW.body := btrim(coalesce(NEW.body, ''));
  NEW.title := nullif(btrim(coalesce(NEW.title, '')), '');
  NEW.work_url := nullif(btrim(coalesce(NEW.work_url, '')), '');
  IF NEW.category NOT IN ('update','work_sample','milestone','learning') THEN
    RAISE EXCEPTION 'Invalid category';
  END IF;
  IF char_length(NEW.body) < 1 OR char_length(NEW.body) > 600 THEN
    RAISE EXCEPTION 'Post text must be 1-600 characters';
  END IF;
  IF NEW.title IS NOT NULL AND char_length(NEW.title) > 120 THEN
    RAISE EXCEPTION 'Title must be at most 120 characters';
  END IF;
  IF NEW.work_url IS NOT NULL AND (char_length(NEW.work_url) > 500 OR NEW.work_url !~* '^https://[a-z0-9.-]+\.[a-z]{2,}(/[^\s<>"]*)?$') THEN
    RAISE EXCEPTION 'Link must be a valid https address';
  END IF;
  IF NEW.category = 'work_sample' AND NEW.title IS NULL THEN
    RAISE EXCEPTION 'Work samples need a title';
  END IF;
  SELECT nullif(btrim(p.name), ''), nullif(btrim(p.title), '') INTO NEW.author_name, NEW.author_title
    FROM public.user_profiles p WHERE p.user_id = NEW.author_id LIMIT 1;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
CREATE TRIGGER prepare_career_post BEFORE INSERT OR UPDATE ON public.career_posts FOR EACH ROW EXECUTE FUNCTION public.prepare_career_post();
REVOKE EXECUTE ON FUNCTION public.prepare_career_post() FROM PUBLIC, anon, authenticated;

CREATE TABLE public.career_post_bookmarks (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  post_id uuid NOT NULL REFERENCES public.career_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);
GRANT SELECT, INSERT, DELETE ON public.career_post_bookmarks TO authenticated;
GRANT ALL ON public.career_post_bookmarks TO service_role;
ALTER TABLE public.career_post_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own bookmarks" ON public.career_post_bookmarks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Members add own bookmarks" ON public.career_post_bookmarks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Members remove own bookmarks" ON public.career_post_bookmarks FOR DELETE TO authenticated USING (user_id = auth.uid());