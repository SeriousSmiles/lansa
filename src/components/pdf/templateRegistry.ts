import { ResumeTemplate } from '@/types/pdf';
import { LucideIcon, Zap, Palette, Sparkles, FileText, Minimize2, Clock, GraduationCap, Building2 } from 'lucide-react';

export type TemplateEngine = 'html' | 'react-pdf';

export interface TemplateConfig {
  id: ResumeTemplate;
  name: string;
  description: string;
  category: 'ATS' | 'Modern' | 'Creative' | 'Academic' | 'Compact';
  engine: TemplateEngine;
  supportsATS: boolean;
  component: () => Promise<any>;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  featured?: boolean;
}

export const templateRegistry: TemplateConfig[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Sophisticated two-column design with dark sidebar',
    category: 'Modern',
    engine: 'react-pdf',
    supportsATS: true,
    component: () => import('./templates/pdf/ProfessionalDoc'),
    icon: Zap,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/5 border-primary/20',
    featured: true,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean gradient header with organized sections',
    category: 'Modern',
    engine: 'html',
    supportsATS: true,
    component: () => import('./templates/ModernTemplate'),
    icon: Palette,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bolder header, visual accents and decorative elements',
    category: 'Creative',
    engine: 'html',
    supportsATS: false,
    component: () => import('./templates/CreativeTemplate'),
    icon: Sparkles,
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50 border-purple-200',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional three-column format, perfect for corporate',
    category: 'ATS',
    engine: 'html',
    supportsATS: true,
    component: () => import('./templates/ClassicTemplate'),
    icon: FileText,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Whitespace, single-column, ATS-optimized',
    category: 'Compact',
    engine: 'react-pdf',
    supportsATS: true,
    component: () => import('./templates/pdf/MinimalDoc'),
    icon: Minimize2,
    colorClass: 'text-gray-600',
    bgClass: 'bg-gray-50 border-gray-200',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Chronology with visual markers and clean layout',
    category: 'Creative',
    engine: 'html',
    supportsATS: false,
    component: () => import('./templates/TimelineTemplate'),
    icon: Clock,
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50 border-orange-200',
  },
  {
    id: 'academic',
    name: 'Academic CV',
    description: 'Multi-page CV with publications and research',
    category: 'Academic',
    engine: 'react-pdf',
    supportsATS: true,
    component: () => import('./templates/pdf/AcademicDoc'),
    icon: GraduationCap,
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50 border-indigo-200',
  },
  {
    id: 'logos',
    name: 'Logos Variant',
    description: 'Company logos with modern professional layout',
    category: 'Modern',
    engine: 'html',
    supportsATS: true,
    component: () => import('./templates/LogosTemplate'),
    icon: Building2,
    colorClass: 'text-cyan-600',
    bgClass: 'bg-cyan-50 border-cyan-200',
  },
];
