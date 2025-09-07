import React from 'react';
import { PDFResumeData } from '@/types/pdf';

interface ModernTemplateProps {
  data: PDFResumeData;
}

export function ModernTemplate({ data }: ModernTemplateProps) {
  const { personalInfo, experience, education, skills, languages, colors } = data;

  return (
    <div 
      id="pdf-resume-template" 
      className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg overflow-hidden relative"
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '11px',
        lineHeight: '1.5',
      }}
    >
      {/* Header */}
      <div 
        className="h-32 relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` 
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between h-full px-8 text-white">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{personalInfo.name}</h1>
            <h2 className="text-lg opacity-90">{personalInfo.title}</h2>
          </div>
          {personalInfo.profileImage && (
            <div className="w-20 h-20 rounded-full border-3 border-white overflow-hidden bg-white/20 ml-6">
              <img 
                src={personalInfo.profileImage} 
                alt={personalInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex h-[calc(100%-8rem)]">
        {/* Left Column */}
        <div className="w-[75mm] bg-gray-50 p-6">
          {/* Contact */}
          <div className="mb-6">
            <h3 
              className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b-2"
              style={{ color: colors.primary, borderColor: colors.primary }}
            >
              Contact
            </h3>
            <div className="space-y-2 text-xs">
              {personalInfo.email && (
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: colors.primary }}
                  ></div>
                  <span className="break-all">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: colors.primary }}
                  ></div>
                  <span>{personalInfo.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-6">
              <h3 
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: colors.primary, borderColor: colors.primary }}
              >
                Skills
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {skills.slice(0, 10).map((skill, index) => (
                  <div 
                    key={index} 
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: colors.primary + '15', color: colors.primary }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="mb-6">
              <h3 
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: colors.primary, borderColor: colors.primary }}
              >
                Languages
              </h3>
              <div className="space-y-3">
                {languages.map((lang, index) => {
                  const percentage = (lang.level / 5) * 100;
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-800">{lang.name}</span>
                        <span className="text-xs text-gray-600">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            backgroundColor: colors.primary,
                            width: `${percentage}%`
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
            <div className="mb-6">
              <h3 
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: colors.primary, borderColor: colors.primary }}
              >
                Objective
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
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: colors.primary, borderColor: colors.primary }}
              >
                Challenge
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {personalInfo.biggestChallenge}
              </p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="flex-1 p-6">
          {/* Summary */}
          {personalInfo.summary && (
            <div className="mb-6">
              <h3 
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: colors.primary, borderColor: colors.primary }}
              >
                Profile
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {personalInfo.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-6">
              <h3 
                className="text-sm font-bold mb-4 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: colors.primary, borderColor: colors.primary }}
              >
                Experience
              </h3>
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={index} className="relative pl-4">
                    <div 
                      className="absolute left-0 top-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    ></div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {exp.title}
                      </h4>
                      {exp.startYear && (
                        <span className="text-xs text-gray-600 ml-2">
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

          {/* Education */}
          {education.length > 0 && (
            <div>
              <h3 
                className="text-sm font-bold mb-4 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: colors.primary, borderColor: colors.primary }}
              >
                Education
              </h3>
              <div className="space-y-3">
                {education.map((edu, index) => (
                  <div key={index} className="relative pl-4">
                    <div 
                      className="absolute left-0 top-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    ></div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {edu.title}
                      </h4>
                      {edu.startYear && (
                        <span className="text-xs text-gray-600 ml-2">
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