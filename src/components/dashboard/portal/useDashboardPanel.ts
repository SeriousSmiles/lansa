import { create } from "zustand";

export type PanelView = "profile" | "ai" | "insights" | "activity";

interface DashboardPanelState {
  open: boolean;
  view: PanelView;
  openPanel: (view: PanelView) => void;
  close: () => void;
  toggle: (view: PanelView) => void;
}

export const useDashboardPanel = create<DashboardPanelState>((set, get) => ({
  open: false,
  view: "profile",
  openPanel: (view) => set({ open: true, view }),
  close: () => set({ open: false }),
  toggle: (view) => {
    const { open, view: current } = get();
    if (open && current === view) {
      set({ open: false });
    } else {
      set({ open: true, view });
    }
  },
}));