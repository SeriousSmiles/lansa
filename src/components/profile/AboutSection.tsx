
import { AboutContainer } from "./about/AboutContainer";

interface AboutSectionProps {
  role: string;
  goal: string;
  blocker: string;
  aboutText?: string;
  onUpdate?: (field: string, value: string) => Promise<void>;
  onUpdateAbout?: (text: string) => Promise<void>;
  onUpdateBiggestChallenge?: (challenge: string) => Promise<void>;
  themeColor?: string;
  highlightColor?: string;
}

export function AboutSection(props: AboutSectionProps) {
  return <AboutContainer {...props} />;
}
