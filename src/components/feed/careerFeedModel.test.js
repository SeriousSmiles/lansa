import { describe, expect, test } from "bun:test";
import { validatePost, isSafeHttpsUrl, categoryLabel } from "./careerFeedModel.ts";

describe("career post rules", () => {
  test("links must be https", () => {
    expect(isSafeHttpsUrl("http://example.com")).toBe(false);
    expect(isSafeHttpsUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpsUrl("https://user:pw@example.com")).toBe(false);
    expect(isSafeHttpsUrl("https://portfolio.example.com/work")).toBe(true);
  });
  test("body is required and capped at 600 characters", () => {
    expect(validatePost({ category: "update", body: "   " }).ok).toBe(false);
    expect(validatePost({ category: "update", body: "a".repeat(601) }).ok).toBe(false);
    expect(validatePost({ category: "update", body: "a".repeat(600) }).ok).toBe(true);
  });
  test("work samples need a title", () => {
    const r = validatePost({ category: "work_sample", body: "Built a menu" });
    expect(r.ok).toBe(false);
    expect(r.errors.title).toBeTruthy();
  });
  test("unknown category is rejected", () => {
    expect(validatePost({ category: "promo", body: "hi" }).ok).toBe(false);
  });
  test("labels", () => {
    expect(categoryLabel("work_sample")).toBe("Work sample");
    expect(categoryLabel("milestone")).toBe("Milestone");
  });
});
