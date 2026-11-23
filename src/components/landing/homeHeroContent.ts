import fbttMark from "@/assets/landing/hero/fbtt-mark.png";
import seriousSmilesIcon from "@/assets/landing/hero/serious-smiles-icon.png";
import lansaMark from "@/assets/lansa-icon-brand.svg";

/** Fictional Curaçao first-name pairs; illustration only. */
export const NAME_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["Jairo", "Kiara"],
  ["Gino", "Naïma"],
  ["Dario", "Aisha"],
  ["Jaden", "Shari"],
  ["Jurick", "Kiana"],
];

export type HeroBusiness = { name: string; src?: string; padding: string; tile: "white" | "ink" };

/** Order is fixed by the owner. Konektá has no confirmed first-party mark yet: add `src` here when available. */
export const HERO_BUSINESSES: ReadonlyArray<HeroBusiness> = [
  { name: "FBTT Travel", src: fbttMark, padding: "16%", tile: "white" },
  { name: "Konektá", padding: "0", tile: "ink" },
  { name: "LANSA", src: lansaMark, padding: "17%", tile: "white" },
  { name: "Serious Smiles", src: seriousSmilesIcon, padding: "0", tile: "white" },
];

export const HERO_INTERVAL_MS = 3200;
