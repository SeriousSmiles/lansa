import React from 'react';
import { PDFResumeData } from '@/types/pdf';
import { Progress } from '@/components/ui/progress';
import lansaBadge from '@/assets/powered-by-lansa-badge.png';

interface ProfessionalTemplateProps {
  data: PDFResumeData;
}

export function ProfessionalTemplate({ data }: ProfessionalTemplateProps) {
  const { personalInfo, experience, education, skills, colors, languages, certifications } = data;

  return (
    <div 
      id="pdf-resume-template" 
      className="mx-auto bg-white shadow-lg overflow-hidden relative"
      style={{
        width: '210mm',
        height: '297mm',
        maxWidth: '210mm',
        maxHeight: '297mm',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
      }}
    >
      {/* Powered by Lansa Badge */}
      <img 
        src={lansaBadge} 
        alt="Powered by Lansa" 
        className="absolute bottom-4 right-4 w-24 opacity-90"
      />
      <div className="flex h-full">
        {/* Left Sidebar */}
        <div 
          className="w-[85mm] h-full p-6 text-white flex flex-col"
          style={{ backgroundColor: colors.primary }}
        >
          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white/20">
              {personalInfo.profileImage ? (
                <img 
                  src={personalInfo.profileImage} 
                  alt={personalInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                  {personalInfo.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 uppercase tracking-wide">Contact</h3>
            <div className="space-y-2 text-sm">
              {personalInfo.email && (
                <div className="flex items-start">
                  <span className="mr-2">📧</span>
                  <span className="break-all">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-start">
                  <span className="mr-2">📞</span>
                  <span>{personalInfo.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 uppercase tracking-wide">Skills</h3>
              <div className="space-y-2">
                {skills.slice(0, 8).map((skill, index) => (
                  <div key={index} className="text-sm">
                    <span className="mr-2">•</span>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 uppercase tracking-wide">Languages</h3>
              <div className="space-y-3">
                {languages.map((lang, index) => {
                  const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
                  const levelName = levelNames[lang.level - 1] || 'Unknown';
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span>{lang.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-white/20">{levelName}</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all"
                          style={{ width: `${(lang.level / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 uppercase tracking-wide">Certifications</h3>
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <div 
                    key={index} 
                    className="p-2 border border-white/20 rounded-lg bg-white/5"
                  >
                    <h4 className="text-sm font-semibold mb-1">
                      {cert.title}
                    </h4>
                    <p className="text-xs opacity-80 mb-1">{cert.issuer}</p>
                    {cert.date && (
                      <p className="text-xs opacity-70">
                        {new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Goal */}
          {personalInfo.professionalGoal && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 uppercase tracking-wide">Goal</h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {personalInfo.professionalGoal}
              </p>
            </div>
          )}

          {/* Biggest Challenge */}
          {personalInfo.biggestChallenge && (
            <div className="mt-auto">
              <h3 className="text-lg font-bold mb-3 uppercase tracking-wide">Challenge</h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {personalInfo.biggestChallenge}
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {personalInfo.name}
            </h1>
            <h2 className="text-xl text-gray-600 mb-4">
              {personalInfo.title}
            </h2>
            {personalInfo.summary && (
              <p className="text-gray-700 leading-relaxed">
                {personalInfo.summary}
              </p>
            )}
          </div>

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase tracking-wide border-b-2 pb-2"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                Experience
              </h3>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="relative">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {exp.title}
                      </h4>
                      <div className="text-sm text-gray-600 ml-4">
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
            <div className="mb-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase tracking-wide border-b-2 pb-2"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                Education
              </h3>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {edu.title}
                      </h4>
                      <div className="text-sm text-gray-600 ml-4">
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
    </div>
  );
}