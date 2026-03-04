import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buttonVariants } from "@/components/ui/button";
import CertificateDoc, { CertificateDocProps } from "@/components/pdf/templates/pdf/CertificateDoc";
import { CertResult, Certification } from "@/types/certification";

interface CertificateDownloadButtonProps {
  result: CertResult;
  certification: Certification;
  userId: string;
  compact?: boolean;
}

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
        .select("name")
        .eq("user_id", userId)
        .single();

      setCandidateName((data as any)?.name || "Professional");
      setLoading(false);
    }
    fetchName();
  }, [userId]);

  const btnClass = buttonVariants({ variant: "primary", size: compact ? "default" : "lg" });

  if (loading || !candidateName) {
    return (
      <div className={`${btnClass} opacity-50 pointer-events-none w-full`}>
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
        <div className={`${btnClass} w-full ${pdfLoading ? "opacity-50 pointer-events-none" : ""}`}>
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
