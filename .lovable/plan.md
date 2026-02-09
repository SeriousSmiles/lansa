

# Persist Banner Dismissal for the Whole Session

## Problem
The announcement banner's dismissed state is stored in React component state (`useState`), so it reappears whenever the component remounts (e.g., navigating between pages).

## Solution
Replace `useState` with `sessionStorage` so dismissal persists for the entire browser session (tab lifetime) but reappears on a new session.

## Technical Details

**File:** `src/components/common/AnnouncementBanner.tsx`

1. Initialize `dismissed` state from `sessionStorage.getItem("banner_dismissed") === "true"`
2. On dismiss, set `sessionStorage.setItem("banner_dismissed", "true")` alongside updating state

This is a small, single-file change -- no other files affected.

