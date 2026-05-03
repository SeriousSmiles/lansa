import { create } from "zustand";

export type PanelView = "profile" | "ai" | "insights" | "activity" | "inbox";

interface DashboardPanelState {
  open: boolean;
  view: PanelView;
  inboxThreadId: string | null;
  openPanel: (view: PanelView, opts?: { threadId?: string | null }) => void;
  close: () => void;
  toggle: (view: PanelView) => void;
  setInboxThread: (threadId: string | null) => void;
}

export const useDashboardPanel = create<DashboardPanelState>((set, get) => ({
  open: false,
  view: "profile",
  inboxThreadId: null,
  openPanel: (view, opts) =>
    set({
      open: true,
      view,
      inboxThreadId:
        view === "inbox" ? opts?.threadId ?? null : get().inboxThreadId,
    }),
  close: () => set({ open: false }),
  setInboxThread: (threadId) => set({ inboxThreadId: threadId }),
  toggle: (view) => {
    const { open, view: current } = get();
    if (open && current === view) {
      set({ open: false });
    } else {
      set({ open: true, view });
    }
  },
}));