export interface PageBreak {
  pageNumber: number;
  startIndex: number;
  endIndex: number;
  sectionType: 'experience' | 'education' | 'skills';
}

export interface ContentSection {
  type: 'header' | 'summary' | 'experience' | 'education' | 'skills';
  height: number;
  data: any;
  index?: number;
}

export interface PaginationResult {
  pages: ContentSection[][];
  totalPages: number;
  hasOverflow: boolean;
}
