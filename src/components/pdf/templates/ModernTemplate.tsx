import React from 'react';
import { PDFResumeData } from '@/types/pdf';

interface ModernTemplateProps {
  data: PDFResumeData;
}

export function ModernTemplate({ data }: ModernTemplateProps) {
  const { personalInfo, experience, education, skills, colors } = data;

  return (
    <div 
      id="pdf-resume-template" 
      className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg overflow-hidden"
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
      }}
    >
      {/* Header Section */}
      <div 
        className="h-[80mm] p-8 text-white relative"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="flex items-start gap-6 h-full">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-28 h-28 rounded-2xl border-4 border-white overflow-hidden bg-white/20">
              {personalInfo.profileImage ? (
                <img 
                  src={personalInfo.profileImage} 
                  alt={personalInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                  {personalInfo.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Header Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold mb-2 leading-tight">
              {personalInfo.name}
            </h1>
            <h2 className="text-xl mb-4 opacity-90">
              {personalInfo.title}
            </h2>
            
            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              {personalInfo.email && (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-xs">📧</span>
                  <span className="opacity-90">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-xs">📞</span>
                  <span className="opacity-90">{personalInfo.phone}</span>
                </div>
              )}
            </div>

            {/* Summary */}
            {personalInfo.summary && (
              <p className="text-sm opacity-90 leading-relaxed max-w-2xl">
                {personalInfo.summary}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-8">
        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
              <div 
                className="w-1 h-6 rounded"
                style={{ backgroundColor: colors.primary }}
              />
              Skills & Expertise
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {skills.slice(0, 12).map((skill, index) => (
                <div 
                  key={index} 
                  className="px-3 py-2 rounded-lg text-sm font-medium border"
                  style={{ 
                    borderColor: colors.primary + '40',
                    backgroundColor: colors.primary + '10',
                    color: colors.primary 
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Goal */}
        {personalInfo.professionalGoal && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
              <div 
                className="w-1 h-6 rounded"
                style={{ backgroundColor: colors.primary }}
              />
              Professional Goal
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {personalInfo.professionalGoal}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
              <div 
                className="w-1 h-6 rounded"
                style={{ backgroundColor: colors.primary }}
              />
              Experience
            </h3>
            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div key={index} className="relative pl-6">
                  <div 
                    className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 bg-white"
                    style={{ borderColor: colors.primary }}
                  />
                  {index < experience.length - 1 && (
                    <div 
                      className="absolute left-1.5 top-4 w-0.5 h-16"
                      style={{ backgroundColor: colors.primary + '30' }}
                    />
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {exp.title}
                    </h4>
                    <div 
                      className="text-sm font-medium px-3 py-1 rounded-full"
                      style={{ 
                        backgroundColor: colors.primary + '20',
                        color: colors.primary 
                      }}
                    >
                      {exp.startYear && (
                        <span>
                          {exp.startYear} - {exp.endYear || 'Present'}
                        </span>
                      )}
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
              <div 
                className="w-1 h-6 rounded"
                style={{ backgroundColor: colors.primary }}
              />
              Education
            </h3>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="flex justify-between items-start p-4 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {edu.title}
                    </h4>
                    {edu.description && (
                      <p className="text-gray-700 leading-relaxed">
                        {edu.description}
                      </p>
                    )}
                  </div>
                  <div 
                    className="text-sm font-medium px-3 py-1 rounded-full ml-4"
                    style={{ 
                      backgroundColor: colors.primary + '20',
                      color: colors.primary 
                    }}
                  >
                    {edu.startYear && (
                      <span>
                        {edu.startYear} - {edu.endYear || 'Present'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}