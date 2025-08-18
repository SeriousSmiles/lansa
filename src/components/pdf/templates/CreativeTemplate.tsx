import React from 'react';
import { PDFResumeData } from '@/types/pdf';

interface CreativeTemplateProps {
  data: PDFResumeData;
}

export function CreativeTemplate({ data }: CreativeTemplateProps) {
  const { personalInfo, experience, education, skills, colors } = data;

  return (
    <div 
      id="pdf-resume-template" 
      className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg"
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
      }}
    >
      {/* Header with geometric design */}
      <div className="relative">
        <div 
          className="h-[100mm] p-8 text-white relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` 
          }}
        >
          {/* Geometric shapes */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
            style={{ backgroundColor: 'white', transform: 'translate(50%, -50%)' }}
          />
          <div 
            className="absolute bottom-0 left-0 w-24 h-24 opacity-10"
            style={{ 
              backgroundColor: 'white',
              clipPath: 'polygon(0 0, 0% 100%, 100% 100%)',
              transform: 'translate(-30%, 30%)'
            }}
          />

          <div className="relative z-10 h-full flex flex-col justify-center">
            <div className="flex items-center gap-8">
              {/* Profile Image */}
              {personalInfo.profileImage && (
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-3xl border-4 border-white overflow-hidden shadow-xl">
                    <img 
                      src={personalInfo.profileImage} 
                      alt={personalInfo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Header Content */}
              <div className="flex-1">
                <h1 className="text-5xl font-bold mb-3 leading-tight">
                  {personalInfo.name}
                </h1>
                <h2 className="text-2xl mb-6 opacity-90 font-light">
                  {personalInfo.title}
                </h2>
                
                {/* Contact with icons */}
                <div className="space-y-2 text-sm opacity-90">
                  {personalInfo.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <span className="text-sm">📧</span>
                      </div>
                      <span>{personalInfo.email}</span>
                    </div>
                  )}
                  {personalInfo.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <span className="text-sm">📞</span>
                      </div>
                      <span>{personalInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-8">
        {/* About */}
        {personalInfo.summary && (
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: colors.primary }}
              >
                👋
              </div>
              <h3 className="text-2xl font-bold text-gray-900">About Me</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-16 text-justify">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Professional Goal */}
        {personalInfo.professionalGoal && (
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: colors.secondary }}
              >
                🎯
              </div>
              <h3 className="text-2xl font-bold text-gray-900">My Goal</h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-16">
              {personalInfo.professionalGoal}
            </p>
          </div>
        )}

        {/* Skills with creative layout */}
        {skills.length > 0 && (
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: colors.primary }}
              >
                ⚡
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Skills</h3>
            </div>
            <div className="ml-16 flex flex-wrap gap-3">
              {skills.slice(0, 10).map((skill, index) => (
                <div 
                  key={index} 
                  className="px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                  style={{ 
                    backgroundColor: index % 2 === 0 ? colors.primary + '20' : colors.secondary + '20',
                    color: index % 2 === 0 ? colors.primary : colors.secondary,
                    border: `1px solid ${index % 2 === 0 ? colors.primary + '40' : colors.secondary + '40'}`
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience with timeline */}
        {experience.length > 0 && (
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: colors.secondary }}
              >
                💼
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Experience</h3>
            </div>
            <div className="ml-16 space-y-6">
              {experience.map((exp, index) => (
                <div key={index} className="relative pl-8">
                  <div 
                    className="absolute left-0 top-2 w-4 h-4 rounded-full border-4 border-white shadow-md"
                    style={{ backgroundColor: colors.primary }}
                  />
                  {index < experience.length - 1 && (
                    <div 
                      className="absolute left-2 top-6 w-0.5 h-20"
                      style={{ backgroundColor: colors.primary + '30' }}
                    />
                  )}
                  <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {exp.title}
                      </h4>
                      <div 
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: colors.primary + '20',
                          color: colors.primary 
                        }}
                      >
                        {exp.startYear && (
                          <span>
                            {exp.startYear} - {exp.endYear || 'Now'}
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: colors.primary }}
              >
                🎓
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Education</h3>
            </div>
            <div className="ml-16 grid gap-4">
              {education.map((edu, index) => (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {edu.title}
                    </h4>
                    <div 
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: colors.secondary + '20',
                        color: colors.secondary 
                      }}
                    >
                      {edu.startYear && (
                        <span>
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </span>
                      )}
                    </div>
                  </div>
                  {edu.description && (
                    <p className="text-gray-700 leading-relaxed">
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
  );
}