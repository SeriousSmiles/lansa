import { expect, test } from "bun:test";
import { getRoleHomePath, getPostAuthDestination } from "./roleRoutes";

test("employer home is the hiring workspace, not the seeker dashboard", () => {
  expect(getRoleHomePath({ userType: "employer" })).toBe("/employer-dashboard");
  expect(getRoleHomePath({ userType: "job_seeker" })).toBe("/dashboard");
});

test("employer authentication cannot resume a seeker profile editor", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: "http://localhost:8080" } };
  try {
    for (const requestedPath of ["/profile", "/profile/resume-editor"]) {
      expect(getPostAuthDestination({
        userType: "employer", hasCompletedOnboarding: true, requestedPath,
      })).toBe("/employer-dashboard");
    }
    expect(getPostAuthDestination({
      userType: "employer", hasCompletedOnboarding: true,
      requestedPath: "/profile/share/candidate",
    })).toBe("/profile/share/candidate");
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});