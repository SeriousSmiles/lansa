const STATS = [
  { value: "40", label: "Questions per exam", note: "~40 seconds each" },
  { value: "4", label: "Sectors to choose from", note: "One that fits you" },
  { value: "XCG 25", label: "One-time fee", note: "No subscription" },
  { value: "∞", label: "Verified for life", note: "Badge stays on your profile" },
];

export function HubOutcomesBand() {
  return (
    <section className="rounded-3xl bg-foreground text-background p-8 md:p-12 lg:p-14">
      <div className="flex items-center gap-3 mb-6">
        <span className="h-px w-8 bg-background/35" aria-hidden />
        <p className="text-[10px] uppercase tracking-[0.32em] font-medium font-public-sans text-background/70">
          What you get
        </p>
      </div>
      <h2 className="font-urbanist font-thin text-[2rem] md:text-[2.8rem] leading-[1.05] tracking-[-0.02em] text-background max-w-[28ch]">
        Built to be earned in an afternoon. Built to{" "}
        <span className="font-normal italic text-primary">last a career.</span>
      </h2>

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
        {STATS.map((s) => (
          <div key={s.label} className="border-t border-background/15 pt-5">
            <p className="font-urbanist font-thin text-[2.4rem] md:text-[3rem] leading-none tracking-[-0.02em] text-background">
              {s.value}
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.22em] font-medium font-public-sans text-background/80">
              {s.label}
            </p>
            <p className="mt-1.5 text-sm font-public-sans font-light text-background/60">
              {s.note}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}