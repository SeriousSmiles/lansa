import { BrandImageSlot } from "@/components/dashboard/portal/decor/BrandImageSlot";

interface HubClosingCtaProps {
  onStart: () => void;
  src?: string;
}

export function HubClosingCta({ onStart, src }: HubClosingCtaProps) {
  return (
    <BrandImageSlot
      aspect="wide"
      placement="image-left"
      tone="cream"
      eyebrow="Your move"
      headline="Your shortlist starts with one exam."
      body="Forty questions stand between your profile and the businesses hiring in Curaçao right now. Pick a sector and start."
      cta={{ label: "Start your certification", onClick: onStart }}
      src={src}
    />
  );
}