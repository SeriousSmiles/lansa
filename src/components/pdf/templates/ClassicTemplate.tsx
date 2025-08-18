import React from 'react';
import { PDFResumeData } from '@/types/pdf';

interface ClassicTemplateProps {
  data: PDFResumeData;
}

export function ClassicTemplate({ data }: ClassicTemplateProps) {
  const { personalInfo, experience, education, skills, colors } = data;

  return (
    <div 
      id="pdf-resume-template" 
      className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg"
      style={{
        fontFamily: 'Times, "Times New Roman", serif',
        fontSize: '12px',
        lineHeight: '1.5',
      }}
    >
      <div className="p-12">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-wide">
            {personalInfo.name.toUpperCase()}
          </h1>
          <h2 className="text-xl text-gray-600 mb-4 italic">
            {personalInfo.title}
          </h2>
          
          {/* Contact Info */}
          <div className="flex justify-center gap-6 text-sm text-gray-700">
            {personalInfo.email && (
              <span>{personalInfo.email}</span>
            )}
            {personalInfo.phone && (
              <span>{personalInfo.phone}</span>
            )}
          </div>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h3 
              className="text-lg font-bold mb-3 tracking-wide border-b pb-1"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              PROFESSIONAL SUMMARY
            </h3>
            <p className="text-gray-700 leading-relaxed text-justify">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Professional Goal */}
        {personalInfo.professionalGoal && (
          <div className="mb-8">
            <h3 
              className="text-lg font-bold mb-3 tracking-wide border-b pb-1"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              OBJECTIVE
            </h3>
            <p className="text-gray-700 leading-relaxed text-justify">
              {personalInfo.professionalGoal}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-8">
            <h3 
              className="text-lg font-bold mb-4 tracking-wide border-b pb-1"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              PROFESSIONAL EXPERIENCE
            </h3>
            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline mb-2">
                    <h4 className="text-base font-semibold text-gray-900">
                      {exp.title}
                    </h4>
                    <div className="text-sm text-gray-600 font-medium">
                      {exp.startYear && (
                        <span>
                          {exp.startYear} - {exp.endYear || 'Present'}
                        </span>
                      )}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="ml-4">
                      <p className="text-gray-700 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-8">
            <h3 
              className="text-lg font-bold mb-4 tracking-wide border-b pb-1"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              EDUCATION
            </h3>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-base font-semibold text-gray-900">
                      {edu.title}
                    </h4>
                    <div className="text-sm text-gray-600 font-medium">
                      {edu.startYear && (
                        <span>
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </span>
                      )}
                    </div>
                  </div>
                  {edu.description && (
                    <div className="ml-4">
                      <p className="text-gray-700 leading-relaxed">
                        {edu.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h3 
              className="text-lg font-bold mb-4 tracking-wide border-b pb-1"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              CORE COMPETENCIES
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {skills.slice(0, 12).map((skill, index) => (
                <div key={index} className="flex items-center">
                  <span 
                    className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span className="text-gray-700">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>References available upon request</p>
        </div>
      </div>
    </div>
  );
}