import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, string[]>();
const inflight = new Map<string, Promise<string[]>>();

async function fetchSummary(jobId: string): Promise<string[]> {
  if (cache.has(jobId)) return cache.get(jobId)!;
  if (inflight.has(jobId)) return inflight.get(jobId)!;

  const p = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke('job-ai-summary', {
        body: { job_id: jobId },
      });
      if (error) throw error;
      const bullets: string[] = Array.isArray(data?.bullets) ? data.bullets : [];
      cache.set(jobId, bullets);
      return bullets;
    } catch (e) {
      console.warn('job-ai-summary failed', e);
      cache.set(jobId, []);
      return [];
    } finally {
      inflight.delete(jobId);
    }
  })();

  inflight.set(jobId, p);
  return p;
}

export function useJobAISummary(jobId: string | undefined, enabled = true) {
  const [bullets, setBullets] = useState<string[]>(jobId && cache.has(jobId) ? cache.get(jobId)! : []);
  const [loading, setLoading] = useState<boolean>(!!jobId && enabled && !cache.has(jobId));

  useEffect(() => {
    if (!jobId || !enabled) return;
    if (cache.has(jobId)) {
      setBullets(cache.get(jobId)!);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchSummary(jobId).then((b) => {
      if (!alive) return;
      setBullets(b);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [jobId, enabled]);

  return { bullets, loading };
}

export function prefetchJobAISummary(jobId: string) {
  if (!cache.has(jobId)) fetchSummary(jobId);
}