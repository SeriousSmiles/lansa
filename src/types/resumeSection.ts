// Resume Section Component Types and Interfaces

export type SectionComponentType = 
  | 'header' 
  | 'experience' 
  | 'education' 
  | 'skills' 
  | 'summary' 
  | 'languages' 
  | 'projects' 
  | 'certifications' 
  | 'achievements'
  | 'custom';

export type SectionCategory = 'basic' | 'professional' | 'creative' | 'custom';

export interface SectionDataSchema {
  fields: string[];
  repeatable: boolean;
}

export interface SectionComponent {
  id: string;
  type: SectionComponentType;
  name: string;
  description?: string;
  category: SectionCategory;
  icon: string;
  thumbnail_url?: string;
  default_design_json: any;
  data_schema: SectionDataSchema;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface LayoutConfig {
  width?: 'full' | 'half' | 'third';
  columns?: number;
  alignment?: 'left' | 'center' | 'right';
}

export type ZoneName = 'header' | 'leftSidebar' | 'main' | 'rightSidebar' | 'footer';
export type LayoutStructure = 'single' | 'two-column' | 'three-column' | 'sidebar-left' | 'sidebar-right';

export interface ZoneConfig {
  width: number;
  minWidth?: number;
  maxWidth?: number;
  sections: string[];
}

export interface PageLayoutConfig {
  structure: LayoutStructure;
  zones: {
    header?: ZoneConfig;
    leftSidebar?: ZoneConfig;
    main?: ZoneConfig;
    rightSidebar?: ZoneConfig;
    footer?: ZoneConfig;
  };
}

export interface SectionInstance {
  id: string;
  resume_design_id?: string;
  component_type: SectionComponentType;
  position: number;
  zone: ZoneName;
  width: 'full' | 'half' | 'third';
  custom_design_json?: any;
  custom_data?: any;
  is_visible: boolean;
  layout_config: LayoutConfig;
  created_at?: string;
  updated_at?: string;
}

export interface SectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  fabricObjects?: any[];
}

export interface ZoneBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GlobalStyles {
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  baseFontSize: number;
}

export interface LayoutSettings {
  structure: LayoutStructure;
  columns: number;
  spacing: 'compact' | 'medium' | 'spacious';
  margins: 'narrow' | 'standard' | 'wide';
  pageSize: 'A4' | 'Letter';
  zones?: PageLayoutConfig['zones'];
}

export interface SectionLayout {
  sectionId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Fabric.js object template types
export interface FabricTextboxTemplate {
  type: 'textbox';
  dataField?: string;
  text?: string;
  left: number;
  top: number;
  width?: number;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fill?: string;
  textAlign?: string;
}

export interface FabricLineTemplate {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
}

export interface FabricGroupTemplate {
  type: 'group';
  dataField?: string;
  objects: (FabricTextboxTemplate | FabricLineTemplate)[];
  left?: number;
  top?: number;
}

export interface SectionTemplate {
  type: SectionComponentType;
  objects: (FabricTextboxTemplate | FabricLineTemplate | FabricGroupTemplate)[];
  layout: {
    height?: number;
    minHeight?: number;
    entryHeight?: number;
    spacing: number;
    padding?: number;
    columns?: number;
  };
  repeatable?: boolean;
}
