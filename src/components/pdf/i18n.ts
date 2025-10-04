export type Locale = 'en' | 'nl' | 'pap';

export interface PDFLabels {
  profile: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
  languages: string;
  certifications: string;
  awards: string;
  volunteer: string;
  contact: string;
  objective: string;
  challenge: string;
  goal: string;
  summary: string;
}

export const labels: Record<Locale, PDFLabels> = {
  en: {
    profile: 'Profile',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    languages: 'Languages',
    certifications: 'Certifications',
    awards: 'Awards',
    volunteer: 'Volunteer Experience',
    contact: 'Contact',
    objective: 'Objective',
    challenge: 'Challenge',
    goal: 'Goal',
    summary: 'Professional Summary',
  },
  nl: {
    profile: 'Profiel',
    experience: 'Ervaring',
    education: 'Opleiding',
    skills: 'Vaardigheden',
    projects: 'Projecten',
    languages: 'Talen',
    certifications: 'Certificaten',
    awards: 'Onderscheidingen',
    volunteer: 'Vrijwilligerswerk',
    contact: 'Contact',
    objective: 'Doelstelling',
    challenge: 'Uitdaging',
    goal: 'Doel',
    summary: 'Professionele Samenvatting',
  },
  pap: {
    profile: 'Profil',
    experience: 'Eksperensia',
    education: 'Edukashon',
    skills: 'Kapasidatnan',
    projects: 'Proyektonan',
    languages: 'Idiomanan',
    certifications: 'Sertifikashonnan',
    awards: 'Premionan',
    volunteer: 'Trabou Voluntario',
    contact: 'Kontakto',
    objective: 'Objetivo',
    challenge: 'Desafio',
    goal: 'Meta',
    summary: 'Resumé Profesional',
  },
};

export function getLabels(locale: Locale = 'en'): PDFLabels {
  return labels[locale] || labels.en;
}
