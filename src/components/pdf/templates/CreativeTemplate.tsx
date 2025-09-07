import React from 'react';
import { PDFResumeData } from '@/types/pdf';

interface CreativeTemplateProps {
  data: PDFResumeData;
}

export function CreativeTemplate({ data }: CreativeTemplateProps) {
  const { personalInfo, experience, education, skills, languages, colors } = data;

  return (
    <div 
      id="pdf-resume-template" 
      className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg overflow-hidden relative flex flex-col"
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '11px',
        lineHeight: '1.5',
      }}
    >
      {/* Decorative Header */}
      <div className="relative">
        <div 
          className="h-20 w-full"
          style={{ background: `linear-gradient(45deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}
        ></div>
        <div 
          className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white overflow-hidden"
          style={{ backgroundColor: colors.primary }}
        >
          {personalInfo.profileImage ? (
            <img 
              src={personalInfo.profileImage} 
              alt={personalInfo.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
              {personalInfo.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-12 px-8">
        {/* Name and Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{personalInfo.name}</h1>
          <h2 
            className="text-lg font-medium"
            style={{ color: colors.primary }}
          >
            {personalInfo.title}
          </h2>
        </div>

        {/* Contact Bar */}
        <div 
          className="flex justify-center items-center gap-6 mb-8 py-3 px-6 rounded-full text-white text-xs"
          style={{ backgroundColor: colors.primary }}
        >
          {personalInfo.phone && (
            <span>📞 {personalInfo.phone}</span>
          )}
          {personalInfo.email && (
            <span>✉️ {personalInfo.email}</span>
          )}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-4">
            {/* Summary */}
            {personalInfo.summary && (
              <div className="mb-6">
                <h3 
                  className="text-lg font-bold mb-3 text-center"
                  style={{ color: colors.primary }}
                >
                  Profile
                </h3>
                <div 
                  className="w-12 h-1 mx-auto mb-3"
                  style={{ backgroundColor: colors.secondary }}
                ></div>
                <p className="text-xs text-gray-700 leading-relaxed text-justify">
                  {personalInfo.summary}
                </p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="mb-6">
                <h3 
                  className="text-lg font-bold mb-3 text-center"
                  style={{ color: colors.primary }}
                >
                  Skills
                </h3>
                <div 
                  className="w-12 h-1 mx-auto mb-3"
                  style={{ backgroundColor: colors.secondary }}
                ></div>
                <div className="space-y-2">
                  {skills.slice(0, 8).map((skill, index) => (
                    <div key={index} className="text-center">
                      <span 
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: colors.primary }}
                      >
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div className="mb-6">
                <h3 
                  className="text-lg font-bold mb-3 text-center"
                  style={{ color: colors.primary }}
                >
                  Languages
                </h3>
                <div 
                  className="w-12 h-1 mx-auto mb-3"
                  style={{ backgroundColor: colors.secondary }}
                ></div>
                <div className="space-y-2">
                  {languages.map((lang, index) => {
                    const percentage = (lang.level / 5) * 100;
                    return (
                      <div key={index} className="text-center">
                        <div className="flex justify-between items-center mb-1 px-2">
                          <span className="text-xs font-medium text-gray-800">{lang.name}</span>
                          <span className="text-xs text-gray-600">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="h-1 rounded-full"
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
                  className="text-lg font-bold mb-3 text-center"
                  style={{ color: colors.primary }}
                >
                  Goal
                </h3>
                <div 
                  className="w-12 h-1 mx-auto mb-3"
                  style={{ backgroundColor: colors.secondary }}
                ></div>
                <p className="text-xs text-gray-700 leading-relaxed text-justify">
                  {personalInfo.professionalGoal}
                </p>
              </div>
            )}

            {/* Biggest Challenge */}
            {personalInfo.biggestChallenge && (
              <div>
                <h3 
                  className="text-lg font-bold mb-3 text-center"
                  style={{ color: colors.primary }}
                >
                  Challenge
                </h3>
                <div 
                  className="w-12 h-1 mx-auto mb-3"
                  style={{ backgroundColor: colors.secondary }}
                ></div>
                <p className="text-xs text-gray-700 leading-relaxed text-justify">
                  {personalInfo.biggestChallenge}
                </p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="col-span-8">
            {/* Experience */}
            {experience.length > 0 && (
              <div className="mb-6">
                <h3 
                  className="text-lg font-bold mb-3"
                  style={{ color: colors.primary }}
                >
                  Experience
                </h3>
                <div 
                  className="w-16 h-1 mb-4"
                  style={{ backgroundColor: colors.secondary }}
                ></div>
                <div className="space-y-5">
                  {experience.map((exp, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: colors.primary }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {exp.title}
                            </h4>
                            {exp.startYear && (
                              <span 
                                className="text-xs px-2 py-1 rounded text-white ml-2"
                                style={{ backgroundColor: colors.secondary }}
                              >
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div>
                <h3 
                  className="text-lg font-bold mb-3"
                  style={{ color: colors.primary }}
                >
                  Education
                </h3>
                <div 
                  className="w-16 h-1 mb-4"
                  style={{ backgroundColor: colors.secondary }}
                ></div>
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: colors.primary }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {edu.title}
                            </h4>
                            {edu.startYear && (
                              <span 
                                className="text-xs px-2 py-1 rounded text-white ml-2"
                                style={{ backgroundColor: colors.secondary }}
                              >
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}