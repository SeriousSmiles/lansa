/**
 * @deprecated This file is deprecated. Use profileToPDFConverter.ts instead.
 * This file remains for backwards compatibility but will be removed in a future version.
 */

import { PDFResumeData } from "@/types/pdf";
import { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { convertProfileToPDFData } from "./profileToPDFConverter";

/**
 * @deprecated Use convertProfileToPDFData from profileToPDFConverter.ts instead
 */
export function mapProfileToPDFData(profileData: ProfileDataReturn): PDFResumeData {
  console.warn(
    'mapProfileToPDFData is deprecated. Use convertProfileToPDFData from profileToPDFConverter.ts instead.'
  );
  return convertProfileToPDFData(profileData);
}