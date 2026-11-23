import { expect, test } from "bun:test";
import { collectProof, nextEditorRoute } from "./profileProofModel.ts";

test("proof only includes safe https links, deduplicated", () => {
  const items = collectProof({
    posts: [{ id: "1", title: "Menu", body: "b", work_url: "https://a.example.com/x" }, { id: "2", title: null, body: "b", work_url: null }],
    projects: [{ id: "p", title: "Site", url: "http://insecure.example.com" }, { id: "q", title: "Dup", url: "https://a.example.com/x" }],
    achievements: [{ id: "a", title: "Award", credentialUrl: "https://cred.example.org" }],
  });
  expect(items.map((i) => i.source)).toEqual(["post", "achievement"]);
});
test("next missing section opens its editor", () => {
  expect(nextEditorRoute([{ key: "education", label: "Add education", cta_route: "" }])).toBe("/profile?action=education");
  expect(nextEditorRoute([])).toBe(null);
});
