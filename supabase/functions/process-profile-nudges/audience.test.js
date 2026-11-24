import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = new Bun.Transpiler({ loader: "ts" }).transformSync(
  readFileSync(new URL("./index.ts", import.meta.url), "utf8").replace(/^import .*;\n/gm, ""),
);

async function runAudience(userType, audienceError = null) {
  let handler;
  let sends = 0;
  let writes = 0;
  const filters = [];
  const client = {
    from(table) {
      const query = {
        select() { return this; },
        eq(key, value) { filters.push([table, key, value]); return this; },
        lt() { return this; }, limit() { return this; }, in() { return this; },
        update() { writes++; return this; }, insert() { writes++; return this; },
        async maybeSingle() {
          return { data: table === "user_answers" ? { user_type: userType } : null, error: audienceError };
        },
        then(resolve) {
          resolve({ data: table === "profile_completion_state" ? [{ user_id: "fixture", score: 10, missing_steps: [], nudge_sequence_step: 0 }] : null, error: null });
        },
      };
      return query;
    },
    auth: { admin: { getUserById: async () => ({ data: { user: { email: "fixture@example.test", created_at: "2020-01-01" } } }) } },
  };
  runInNewContext(source, {
    Deno: { env: { get: () => "fixture-only" }, serve: (fn) => { handler = fn; } },
    createClient: () => client,
    buildNudge: () => ({ subject: "fixture", html: "fixture" }),
    STEP_DELAYS_HOURS: { 1: 24 }, STEP_TEMPLATE_KEY: { 1: "fixture" },
    Response, Date,
    fetch: async () => { sends++; return { ok: true, json: async () => ({ id: "fixture" }) }; },
  });
  const response = await handler({ method: "GET" });
  return { result: await response.json(), sends, writes, filters };
}

test("profile nudges exclude employers even when a stale completion row is returned", async () => {
  const r = await runAudience("employer");
  expect(r.filters).toContainEqual(["profile_completion_state", "user_type", "job_seeker"]);
  expect(r.sends).toBe(0);
  expect(r.writes).toBe(0);
  expect(r.result.results[0].status).toBe("not_seeker");
});

test("profile nudges stop on unavailable current audience", async () => {
  const r = await runAudience(null, { message: "fixture read failed" });
  expect(r.sends).toBe(0);
  expect(r.writes).toBe(0);
});

test("seeker profile nudges retain their existing send path", async () => {
  const r = await runAudience("job_seeker");
  expect(r.sends).toBe(1);
  expect(r.result.results[0].status).toBe("sent");
});