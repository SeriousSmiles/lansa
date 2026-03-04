import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CertificateDoc, { CertificateDocProps } from "@/components/pdf/templates/pdf/CertificateDoc";
import { CertResult, Certification } from "@/types/certification";

interface CertificateDownloadButtonProps {
  result: CertResult;
  certification: Certification;
  userId: string;
}

export default function CertificateDownloadButton({
  result,
  certification,
  userId,
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
      <Button disabled className="flex-1" size="lg">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Preparing Certificate…
      </Button>
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
      className="flex-1"
    >
      {({ loading: pdfLoading }) => (
        <Button className="w-full" size="lg" disabled={pdfLoading}>
          {pdfLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF…
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
