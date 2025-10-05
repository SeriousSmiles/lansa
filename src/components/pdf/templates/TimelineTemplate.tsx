import React from 'react';
import { PDFResumeData } from '@/types/pdf';
import { PDFGenerationOptions } from '@/types/pdf';
import { getLabels } from '../i18n';

interface TimelineTemplateProps {
  data: PDFResumeData;
  options?: PDFGenerationOptions;
}

export function TimelineTemplate({ data, options }: TimelineTemplateProps) {
  const { personalInfo, experience, education, skills, languages, colors } = data;
  const labels = getLabels(options?.locale);
  const atsMode = options?.atsSafe || false;

  return (
    <div 
      id="pdf-resume-template" 
      className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg overflow-hidden"
      style={{
        fontFamily: atsMode ? 'ui-sans-serif, system-ui, sans-serif' : 'Urbanist, Public Sans, sans-serif',
        fontSize: '11px',
        lineHeight: '1.5',
      }}
    >
      {/* Header */}
      <div 
        className="p-8 pb-6"
        style={{ 
          background: atsMode ? '#f5f5f5' : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
          color: atsMode ? '#1a1a1a' : '#ffffff',
        }}
      >
        <h1 className="text-3xl font-bold mb-2">{personalInfo.name}</h1>
        <h2 className="text-lg opacity-90 mb-3">{personalInfo.title}</h2>
        <div className="flex gap-4 text-sm">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
        </div>
      </div>

      <div className="flex h-[calc(100%-10rem)]">
        {/* Timeline Column */}
        <div className="w-[50mm] bg-gray-50 p-6 border-r-2" style={{ borderColor: atsMode ? '#e0e0e0' : colors.primary }}>
          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-8">
              <h3 
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b"
                style={{ color: atsMode ? '#1a1a1a' : colors.primary, borderColor: atsMode ? '#e0e0e0' : colors.primary }}
              >
                {labels.skills}
              </h3>
              <ul className="space-y-1">
                {skills.slice(0, 12).map((skill, index) => (
                  <li key={index} className="text-xs text-gray-700">
                    • {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="mb-8">
              <h3 
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b"
                style={{ color: atsMode ? '#1a1a1a' : colors.primary, borderColor: atsMode ? '#e0e0e0' : colors.primary }}
              >
                {labels.languages}
              </h3>
              <div className="space-y-3">
                {languages.map((lang, index) => {
                  const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
                  const levelName = levelNames[lang.level - 1] || 'Unknown';
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-800">{lang.name}</span>
                        <span 
                          className="text-xs font-medium px-2 py-0.5 rounded"
                          style={{ 
                            backgroundColor: atsMode ? '#e0e0e0' : `${colors.primary}15`,
                            color: atsMode ? '#333' : colors.primary 
                          }}
                        >
                          {levelName}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${(lang.level / 5) * 100}%`,
                            backgroundColor: atsMode ? '#666' : colors.primary
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Professional Goal */}
          {personalInfo.professionalGoal && (
            <div className="mb-8">
              <h3 
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b"
                style={{ color: atsMode ? '#1a1a1a' : colors.primary, borderColor: atsMode ? '#e0e0e0' : colors.primary }}
              >
                {labels.objective}
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {personalInfo.professionalGoal}
              </p>
            </div>
          )}

          {/* Biggest Challenge */}
          {personalInfo.biggestChallenge && (
            <div>
              <h3 
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b"
                style={{ color: atsMode ? '#1a1a1a' : colors.primary, borderColor: atsMode ? '#e0e0e0' : colors.primary }}
              >
                Challenge
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {personalInfo.biggestChallenge}
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Summary */}
          {personalInfo.summary && (
            <div className="mb-6">
              <h3 
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: atsMode ? '#1a1a1a' : colors.primary, borderColor: atsMode ? '#e0e0e0' : colors.primary }}
              >
                {labels.profile}
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {personalInfo.summary}
              </p>
            </div>
          )}

          {/* Experience Timeline */}
          {experience.length > 0 && (
            <div className="mb-6">
              <h3 
                className="text-sm font-bold mb-4 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: atsMode ? '#1a1a1a' : colors.primary, borderColor: atsMode ? '#e0e0e0' : colors.primary }}
              >
                {labels.experience}
              </h3>
              <div className="relative pl-6 border-l-2" style={{ borderColor: atsMode ? '#e0e0e0' : colors.primary }}>
                {experience.map((exp, index) => (
                  <div key={index} className="relative mb-6 pb-6 border-b border-gray-200 last:border-0">
                    {/* Timeline Marker */}
                    <div 
                      className="absolute -left-[1.6rem] top-1 w-3 h-3 rounded-full border-2 bg-white"
                      style={{ borderColor: atsMode ? '#666' : colors.primary }}
                    ></div>
                    
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {exp.title}
                      </h4>
                      {exp.startYear && (
                        <span className="text-xs text-gray-600 ml-2 whitespace-nowrap">
                          {exp.startYear} - {exp.endYear || 'Present'}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Timeline */}
          {education.length > 0 && (
            <div>
              <h3 
                className="text-sm font-bold mb-4 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: atsMode ? '#1a1a1a' : colors.primary, borderColor: atsMode ? '#e0e0e0' : colors.primary }}
              >
                {labels.education}
              </h3>
              <div className="relative pl-6 border-l-2" style={{ borderColor: atsMode ? '#e0e0e0' : colors.primary }}>
                {education.map((edu, index) => (
                  <div key={index} className="relative mb-6 pb-6 border-b border-gray-200 last:border-0">
                    {/* Timeline Marker */}
                    <div 
                      className="absolute -left-[1.6rem] top-1 w-3 h-3 rounded-full border-2 bg-white"
                      style={{ borderColor: atsMode ? '#666' : colors.primary }}
                    ></div>
                    
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {edu.title}
                      </h4>
                      {edu.startYear && (
                        <span className="text-xs text-gray-600 ml-2 whitespace-nowrap">
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </span>
                      )}
                    </div>
                    {edu.description && (
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimelineTemplate;
