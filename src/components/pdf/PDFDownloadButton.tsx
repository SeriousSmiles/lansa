import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PDFDownloadDialog } from "@/components/pdf/PDFDownloadDialog";
import { ProfileDataReturn } from "@/hooks/profile/profileTypes";

interface PDFDownloadButtonProps {
  profileData: ProfileDataReturn;
  variant?: "primary" | "outline" | "ghost" | "link" | "google" | "contrast";
  size?: "sm" | "lg" | "icon";
  style?: React.CSSProperties;
  className?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export function PDFDownloadButton({ 
  profileData, 
  variant = "outline", 
  size = "sm",
  style,
  className = "",
  fullWidth = false,
  children 
}: PDFDownloadButtonProps) {
  return (
    <PDFDownloadDialog profileData={profileData}>
      <Button 
        variant={variant} 
        size={size}
        style={style}
        className={`${fullWidth ? 'w-full' : ''} ${className}`}
      >
        {children || (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download Resume
          </>
        )}
      </Button>
    </PDFDownloadDialog>
  );
}