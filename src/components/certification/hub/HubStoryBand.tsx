import { BrandImageSlot } from "@/components/dashboard/portal/decor/BrandImageSlot";

const CHAPTERS = [
  {
    eyebrow: "Chapter 01 · Verified, not assumed",
    headline: "A claim on a CV is a guess. A Lansa cert is proof.",
    body:
      "Sector-specific exams test the things employers actually hire for — accountability, applied thinking, workplace intelligence — and put a verified mark on your profile.",
    placement: "image-left" as const,
    tone: "cream" as const,
  },
  {
    eyebrow: "Chapter 02 · Show up where employers look",
    headline: "Pass once. Become discoverable everywhere.",
    body:
      "Certified profiles are the only ones surfaced in employer Browse and recommended candidate feeds. No certification, no shortlist.",
    placement: "image-right" as const,
    tone: "cream" as const,
  },
  {
    eyebrow: "Chapter 03 · Apply with weight behind your name",
    headline: "Live listings, opened to you.",
    body:
      "Once you're certified you can apply to real jobs from real Curaçao businesses — and your application lands with a verified badge attached.",
    placement: "image-left" as const,
    tone: "cream" as const,
  },
];

export function HubStoryBand() {
  return (
    <section id="how-it-works" className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-foreground/25" aria-hidden />
        <p className="text-[10px] uppercase tracking-[0.32em] font-medium font-public-sans text-foreground/55">
          Why certify
        </p>
      </div>
      <h2 className="font-urbanist font-thin text-[2rem] md:text-[2.6rem] leading-[1.05] tracking-[-0.02em] text-foreground max-w-[24ch]">
        Three things change the moment you pass.
      </h2>

      <div className="space-y-6 md:space-y-8 pt-2">
        {CHAPTERS.map((c, i) => (
          <BrandImageSlot
            key={i}
            aspect="wide"
            placement={c.placement}
            tone={c.tone}
            eyebrow={c.eyebrow}
            headline={c.headline}
            body={c.body}
          />
        ))}
      </div>
    </section>
  );
}