import { expect, test } from "bun:test";
import { seekerTabFor } from "./seekerNavModel.ts";
test("each seeker destination lights exactly one tab", () => {
  expect(seekerTabFor("/dashboard")).toBe("home");
  expect(seekerTabFor("/notifications")).toBe("home");
  expect(seekerTabFor("/certification/office")).toBe("home");
  expect(seekerTabFor("/feed/abc")).toBe("feed");
  expect(seekerTabFor("/discovery")).toBe("jobs");
  expect(seekerTabFor("/chat/t1")).toBe("inbox");
  expect(seekerTabFor("/profile/resume-editor")).toBe("profile");
  expect(seekerTabFor("/card")).toBe("profile");
});
