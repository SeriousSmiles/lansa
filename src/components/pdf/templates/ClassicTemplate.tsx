import React from 'react';
import { PDFResumeData } from '@/types/pdf';
import lansaBadge from '@/assets/powered-by-lansa-badge.png';

interface ClassicTemplateProps {
  data: PDFResumeData;
}

export function ClassicTemplate({ data }: ClassicTemplateProps) {
  const { personalInfo, experience, education, skills, languages, colors, certifications } = data;

  return (
    <div 
      id="pdf-resume-template" 
      className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg overflow-hidden flex flex-col relative"
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '12px',
        lineHeight: '1.6',
      }}
    >
      {/* Powered by Lansa Badge */}
      <img 
        src={lansaBadge} 
        alt="Powered by Lansa" 
        className="absolute bottom-4 right-4 w-24 opacity-90 z-10"
      />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-wide">
            {personalInfo.name.toUpperCase()}
          </h1>
          <h2 className="text-xl text-gray-700 mb-4">
            {personalInfo.title}
          </h2>
          <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
          </div>
        </div>

        {/* Professional Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wider">
              Professional Summary
            </h3>
            <p className="text-gray-700 leading-relaxed text-justify">
              {personalInfo.summary}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2">
            {/* Experience */}
            {experience.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider border-b border-gray-300 pb-2">
                  Professional Experience
                </h3>
                <div className="space-y-6">
                  {experience.map((exp, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-base font-semibold text-gray-900">
                          {exp.title}
                        </h4>
                        {exp.startYear && (
                          <span className="text-sm text-gray-600 font-medium">
                            {exp.startYear} - {exp.endYear || 'Present'}
                          </span>
                        )}
                      </div>
                      {exp.description && (
                        <p className="text-gray-700 leading-relaxed text-justify">
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
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider border-b border-gray-300 pb-2">
                  Education
                </h3>
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-base font-semibold text-gray-900">
                          {edu.title}
                        </h4>
                        {edu.startYear && (
                          <span className="text-sm text-gray-600 font-medium">
                            {edu.startYear} - {edu.endYear || 'Present'}
                          </span>
                        )}
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

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider border-b border-gray-300 pb-2">
                  Certifications
                </h3>
                <div className="space-y-3">
                  {certifications.map((cert, index) => (
                    <div key={index} className="p-3 border border-gray-300 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {cert.title}
                        </h4>
                        {cert.date && (
                          <span className="text-xs text-gray-600 font-medium">
                            {new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{cert.issuer}</p>
                      {cert.credentialId && (
                        <p className="text-xs text-gray-600 mt-1">ID: {cert.credentialId}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-1">
            {/* Profile Image */}
            {personalInfo.profileImage && (
              <div className="mb-6 text-center">
                <div className="w-32 h-32 mx-auto border-4 border-gray-300 overflow-hidden">
                  <img 
                    src={personalInfo.profileImage} 
                    alt={personalInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wider border-b border-gray-300 pb-2">
                  Core Skills
                </h3>
                <ul className="space-y-1">
                  {skills.slice(0, 10).map((skill, index) => (
                    <li key={index} className="text-sm text-gray-700 leading-relaxed">
                      • {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wider border-b border-gray-300 pb-2">
                  Languages
                </h3>
                <div className="space-y-3">
                  {languages.map((lang, index) => {
                    const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
                    const levelName = levelNames[lang.level - 1] || 'Unknown';
                    
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-800">{lang.name}</span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                            {levelName}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all bg-gray-700"
                            style={{ width: `${(lang.level / 5) * 100}%` }}
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
                <h3 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wider border-b border-gray-300 pb-2">
                  Career Objective
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed text-justify">
                  {personalInfo.professionalGoal}
                </p>
              </div>
            )}

            {/* Biggest Challenge */}
            {personalInfo.biggestChallenge && (
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wider border-b border-gray-300 pb-2">
                  Key Challenge
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed text-justify">
                  {personalInfo.biggestChallenge}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}