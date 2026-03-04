import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CertificateDoc, { CertificateDocProps } from "@/components/pdf/templates/pdf/CertificateDoc";
import { CertResult, Certification } from "@/types/certification";

interface CertificateDownloadButtonProps {
  result: CertResult;
  certification: Certification;
  userId: string;
  compact?: boolean;
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";
const buttonPrimary =
  "bg-primary text-primary-foreground hover:bg-primary/90";
const buttonSizeLg = "h-11 px-8 text-base";
const buttonSizeMd = "h-9 px-4 text-sm";

export default function CertificateDownloadButton({
  result,
  certification,
  userId,
  compact = false,
}: CertificateDownloadButtonProps) {
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchName() {
      const { data } = await supabase
        .from("user_profiles")
        .select("full_name, first_name, last_name")
        .eq("user_id", userId)
        .single();

      if (data) {
        const name =
          (data as any).full_name ||
          [(data as any).first_name, (data as any).last_name]
            .filter(Boolean)
            .join(" ") ||
          "Professional";
        setCandidateName(name);
      } else {
        setCandidateName("Professional");
      }
      setLoading(false);
    }
    fetchName();
  }, [userId]);

  if (loading || !candidateName) {
    return (
      <div
        className={`${buttonBase} ${buttonPrimary} ${compact ? buttonSizeMd : buttonSizeLg} opacity-50 pointer-events-none ${compact ? "w-full" : "flex-1"}`}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {compact ? "Preparing…" : "Preparing Certificate…"}
      </div>
    );
  }

  const docProps: CertificateDocProps = {
    candidateName,
    sector: result.sector,
    level: (certification.level as any) === "high_performer" ? "high_performer" : "standard",
    totalScore: result.total_score,
    categoryScores: result.category_scores as Record<string, number>,
    aiSummary: result.ai_summary_text || undefined,
    dateIssued: certification.date_issued,
    verificationCode: certification.verification_code,
  };

  const fileName = `lansa-certificate-${result.sector}-${certification.verification_code}.pdf`;

  return (
    <PDFDownloadLink
      document={<CertificateDoc {...docProps} />}
      fileName={fileName}
      style={{ textDecoration: "none" }}
      className={compact ? "w-full" : "flex-1"}
    >
      {({ loading: pdfLoading }) => (
        <div
          className={`${buttonBase} ${buttonPrimary} ${compact ? buttonSizeMd : buttonSizeLg} w-full ${pdfLoading ? "opacity-50 pointer-events-none" : ""}`}
        >
          {pdfLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {compact ? "Generating…" : "Generating PDF…"}
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              {compact ? "Download" : "Download Certificate"}
            </>
          )}
        </div>
      )}
    </PDFDownloadLink>
  );
}
