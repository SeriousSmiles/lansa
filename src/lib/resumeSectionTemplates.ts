import { SectionTemplate, SectionComponentType } from '@/types/resumeSection';

// Pre-defined Fabric.js templates for each section type
export const SECTION_TEMPLATES: Record<SectionComponentType, SectionTemplate> = {
  header: {
    type: 'header',
    objects: [
      {
        type: 'textbox',
        dataField: 'name',
        text: 'YOUR NAME',
        left: 40,
        top: 30,
        width: 500,
        fontSize: 32,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'left'
      },
      {
        type: 'textbox',
        dataField: 'title',
        text: 'The role you are applying for?',
        left: 40,
        top: 70,
        width: 500,
        fontSize: 16,
        fill: '#666666',
        textAlign: 'left'
      },
      {
        type: 'textbox',
        dataField: 'contact',
        text: '📞 Phone  📧 Email  📍 Location',
        left: 40,
        top: 100,
        width: 500,
        fontSize: 12,
        fill: '#666666',
        textAlign: 'left'
      }
    ],
    layout: {
      height: 140,
      spacing: 10,
      padding: 20
    },
    repeatable: false
  },

  summary: {
    type: 'summary',
    objects: [
      {
        type: 'textbox',
        text: 'PROFESSIONAL SUMMARY',
        left: 40,
        top: 0,
        width: 500,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'left'
      },
      {
        type: 'line',
        x1: 40,
        y1: 25,
        x2: 540,
        y2: 25,
        stroke: '#000000',
        strokeWidth: 1
      },
      {
        type: 'textbox',
        dataField: 'aboutText',
        text: 'Write a brief summary about your professional background and goals...',
        left: 40,
        top: 35,
        width: 500,
        fontSize: 11,
        fill: '#333333',
        textAlign: 'left'
      }
    ],
    layout: {
      minHeight: 100,
      spacing: 10
    },
    repeatable: false
  },

  experience: {
    type: 'experience',
    objects: [
      {
        type: 'textbox',
        text: 'PROFESSIONAL EXPERIENCE',
        left: 40,
        top: 0,
        width: 500,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'left'
      },
      {
        type: 'line',
        x1: 40,
        y1: 25,
        x2: 540,
        y2: 25,
        stroke: '#000000',
        strokeWidth: 1
      },
      {
        type: 'group',
        dataField: 'experiences[]',
        top: 35,
        objects: [
          {
            type: 'textbox',
            dataField: 'title',
            text: 'Job Title',
            left: 40,
            top: 0,
            width: 350,
            fontSize: 13,
            fontWeight: 'bold',
            fill: '#000000',
            textAlign: 'left'
          },
          {
            type: 'textbox',
            dataField: 'company',
            text: 'Company Name',
            left: 40,
            top: 20,
            width: 250,
            fontSize: 12,
            fill: '#666666',
            textAlign: 'left'
          },
          {
            type: 'textbox',
            dataField: 'dates',
            text: 'Start Date - End Date',
            left: 300,
            top: 20,
            width: 240,
            fontSize: 11,
            fill: '#999999',
            textAlign: 'right'
          },
          {
            type: 'textbox',
            dataField: 'description',
            text: 'Job description and key achievements...',
            left: 40,
            top: 40,
            width: 500,
            fontSize: 11,
            fill: '#333333',
            textAlign: 'left'
          }
        ]
      }
    ],
    layout: {
      entryHeight: 120,
      spacing: 15
    },
    repeatable: true
  },

  education: {
    type: 'education',
    objects: [
      {
        type: 'textbox',
        text: 'EDUCATION',
        left: 40,
        top: 0,
        width: 500,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'left'
      },
      {
        type: 'line',
        x1: 40,
        y1: 25,
        x2: 540,
        y2: 25,
        stroke: '#000000',
        strokeWidth: 1
      },
      {
        type: 'group',
        dataField: 'education[]',
        top: 35,
        objects: [
          {
            type: 'textbox',
            dataField: 'degree',
            text: 'Degree Name',
            left: 40,
            top: 0,
            width: 350,
            fontSize: 13,
            fontWeight: 'bold',
            fill: '#000000',
            textAlign: 'left'
          },
          {
            type: 'textbox',
            dataField: 'institution',
            text: 'Institution Name',
            left: 40,
            top: 20,
            width: 250,
            fontSize: 12,
            fill: '#666666',
            textAlign: 'left'
          },
          {
            type: 'textbox',
            dataField: 'dates',
            text: 'Graduation Year',
            left: 300,
            top: 20,
            width: 240,
            fontSize: 11,
            fill: '#999999',
            textAlign: 'right'
          },
          {
            type: 'textbox',
            dataField: 'description',
            text: 'Additional details...',
            left: 40,
            top: 40,
            width: 500,
            fontSize: 11,
            fill: '#333333',
            textAlign: 'left'
          }
        ]
      }
    ],
    layout: {
      entryHeight: 100,
      spacing: 15
    },
    repeatable: true
  },

  skills: {
    type: 'skills',
    objects: [
      {
        type: 'textbox',
        text: 'SKILLS',
        left: 40,
        top: 0,
        width: 500,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'left'
      },
      {
        type: 'line',
        x1: 40,
        y1: 25,
        x2: 540,
        y2: 25,
        stroke: '#000000',
        strokeWidth: 1
      },
      {
        type: 'textbox',
        dataField: 'skills',
        text: 'Skill 1 • Skill 2 • Skill 3 • Skill 4',
        left: 40,
        top: 35,
        width: 500,
        fontSize: 11,
        fill: '#333333',
        textAlign: 'left'
      }
    ],
    layout: {
      height: 80,
      spacing: 10,
      columns: 3
    },
    repeatable: false
  },

  languages: {
    type: 'languages',
    objects: [
      {
        type: 'textbox',
        text: 'LANGUAGES',
        left: 40,
        top: 0,
        width: 500,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'left'
      },
      {
        type: 'line',
        x1: 40,
        y1: 25,
        x2: 540,
        y2: 25,
        stroke: '#000000',
        strokeWidth: 1
      },
      {
        type: 'textbox',
        dataField: 'languages',
        text: 'English (Native) • Spanish (Professional)',
        left: 40,
        top: 35,
        width: 500,
        fontSize: 11,
        fill: '#333333',
        textAlign: 'left'
      }
    ],
    layout: {
      height: 70,
      spacing: 10,
      columns: 2
    },
    repeatable: false
  },

  projects: {
    type: 'projects',
    objects: [
      {
        type: 'textbox',
        text: 'PROJECTS',
        left: 40,
        top: 0,
        width: 500,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'left'
      },
      {
        type: 'line',
        x1: 40,
        y1: 25,
        x2: 540,
        y2: 25,
        stroke: '#000000',
        strokeWidth: 1
      },
      {
        type: 'group',
        dataField: 'projects[]',
        top: 35,
        objects: [
          {
            type: 'textbox',
            dataField: 'title',
            text: 'Project Name',
            left: 40,
            top: 0,
            width: 500,
            fontSize: 13,
            fontWeight: 'bold',
            fill: '#000000',
            textAlign: 'left'
          },
          {
            type: 'textbox',
            dataField: 'description',
            text: 'Project description and technologies used...',
            left: 40,
            top: 20,
            width: 500,
            fontSize: 11,
            fill: '#333333',
            textAlign: 'left'
          }
        ]
      }
    ],
    layout: {
      entryHeight: 110,
      spacing: 15
    },
    repeatable: true
  },

  certifications: {
    type: 'certifications',
    objects: [
      {
        type: 'textbox',
        text: 'TRAINING & COURSES',
        left: 40,
        top: 0,
        width: 500,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'left'
      },
      {
        type: 'line',
        x1: 40,
        y1: 25,
        x2: 540,
        y2: 25,
        stroke: '#000000',
        strokeWidth: 1
      },
      {
        type: 'group',
        dataField: 'certifications[]',
        top: 35,
        objects: [
          {
            type: 'textbox',
            dataField: 'title',
            text: 'Certification Name',
            left: 40,
            top: 0,
            width: 350,
            fontSize: 12,
            fontWeight: 'bold',
            fill: '#000000',
            textAlign: 'left'
          },
          {
            type: 'textbox',
            dataField: 'issuer',
            text: 'Issuing Organization',
            left: 40,
            top: 18,
            width: 250,
            fontSize: 11,
            fill: '#666666',
            textAlign: 'left'
          },
          {
            type: 'textbox',
            dataField: 'date',
            text: 'Issue Date',
            left: 300,
            top: 18,
            width: 240,
            fontSize: 11,
            fill: '#999999',
            textAlign: 'right'
          }
        ]
      }
    ],
    layout: {
      entryHeight: 80,
      spacing: 12
    },
    repeatable: true
  },

  achievements: {
    type: 'achievements',
    objects: [
      {
        type: 'textbox',
        text: 'KEY ACHIEVEMENTS',
        left: 40,
        top: 0,
        width: 500,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'left'
      },
      {
        type: 'line',
        x1: 40,
        y1: 25,
        x2: 540,
        y2: 25,
        stroke: '#000000',
        strokeWidth: 1
      },
      {
        type: 'group',
        dataField: 'achievements[]',
        top: 35,
        objects: [
          {
            type: 'textbox',
            dataField: 'title',
            text: 'Achievement Title',
            left: 40,
            top: 0,
            width: 500,
            fontSize: 12,
            fontWeight: 'bold',
            fill: '#000000',
            textAlign: 'left'
          },
          {
            type: 'textbox',
            dataField: 'description',
            text: 'Description of the achievement...',
            left: 40,
            top: 18,
            width: 500,
            fontSize: 11,
            fill: '#333333',
            textAlign: 'left'
          }
        ]
      }
    ],
    layout: {
      entryHeight: 90,
      spacing: 12
    },
    repeatable: true
  },

  custom: {
    type: 'custom',
    objects: [
      {
        type: 'textbox',
        text: 'CUSTOM SECTION',
        left: 40,
        top: 0,
        width: 500,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'left'
      },
      {
        type: 'line',
        x1: 40,
        y1: 25,
        x2: 540,
        y2: 25,
        stroke: '#000000',
        strokeWidth: 1
      },
      {
        type: 'textbox',
        dataField: 'customText',
        text: 'Add your custom content here...',
        left: 40,
        top: 35,
        width: 500,
        fontSize: 11,
        fill: '#333333',
        textAlign: 'left'
      }
    ],
    layout: {
      minHeight: 80,
      spacing: 10
    },
    repeatable: false
  }
};

// Helper function to get template by type
export function getSectionTemplate(type: SectionComponentType): SectionTemplate {
  return SECTION_TEMPLATES[type];
}
