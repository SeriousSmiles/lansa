import React from 'react';
import { PDFResumeData } from '@/types/pdf';
import { PDFGenerationOptions } from '@/types/pdf';
import { getLabels } from '../i18n';
import lansaBadge from '@/assets/powered-by-lansa-badge.png';

interface LogosTemplateProps {
  data: PDFResumeData;
  options?: PDFGenerationOptions;
}

export function LogosTemplate({ data, options }: LogosTemplateProps) {
  const { personalInfo, experience, education, skills, languages, colors, certifications } = data;
  const labels = getLabels(options?.locale);
  const atsMode = options?.atsSafe || false;
  const showPhoto = options?.includePhoto !== false && !atsMode;

  return (
    <div 
      id="pdf-resume-template" 
      className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg overflow-hidden relative"
      style={{
        fontFamily: atsMode ? 'ui-sans-serif, system-ui, sans-serif' : 'Urbanist, Public Sans, sans-serif',
        fontSize: '11px',
        lineHeight: '1.5',
      }}
    >
      {/* Powered by Lansa Badge */}
      <img 
        src={lansaBadge} 
        alt="Powered by Lansa" 
        className="absolute bottom-4 right-4 w-24 opacity-90 z-10"
      />
      {/* Header */}
      <div className="flex items-start justify-between p-8 pb-6 border-b-2" style={{ borderColor: atsMode ? '#e0e0e0' : colors.primary }}>
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2" style={{ color: atsMode ? '#1a1a1a' : colors.primary }}>
            {personalInfo.name}
          </h1>
          <h2 className="text-xl text-gray-700 mb-4">{personalInfo.title}</h2>
          <div className="flex gap-4 text-sm text-gray-600">
            {personalInfo.email && <span>📧 {personalInfo.email}</span>}
            {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
          </div>
        </div>
        {showPhoto && personalInfo.profileImage && (
          <div className="w-24 h-24 rounded-lg border-2 overflow-hidden ml-6" style={{ borderColor: colors.primary }}>
            <img 
              src={personalInfo.profileImage} 
              alt={personalInfo.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="flex h-[calc(100%-11rem)]">
        {/* Left Sidebar */}
        <div className="w-[75mm] bg-gray-50 p-6">
          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-6">
              <h3 
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: atsMode ? '#1a1a1a' : colors.primary, borderColor: atsMode ? '#e0e0e0' : colors.primary }}
              >
                {labels.skills}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 12).map((skill, index) => (
                  <span 
                    key={index} 
                    className="text-xs px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: atsMode ? '#e0e0e0' : colors.primary + '20', 
                      color: atsMode ? '#333' : colors.primary 
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="mb-6">
              <h3 
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b-2"
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
            <div className="mb-6">
              <h3 
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b-2"
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
                className="text-sm font-bold mb-3 uppercase tracking-wider pb-2 border-b-2"
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

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-6">
              <h3 
                className="text-sm font-bold mb-4 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: atsMode ? '#1a1a1a' : colors.primary, borderColor: atsMode ? '#e0e0e0' : colors.primary }}
              >
                {labels.experience}
              </h3>
              <div className="space-y-5">
                {experience.map((exp, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {exp.title}
                        </h4>
                        {exp.startYear && (
                          <div className="text-xs text-gray-600">
                            {exp.startYear} - {exp.endYear || 'Present'}
                          </div>
                        )}
                      </div>
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
            <div className="mb-6">
              <h3 
                className="text-sm font-bold mb-4 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: atsMode ? '#1a1a1a' : colors.primary, borderColor: atsMode ? '#e0e0e0' : colors.primary }}
              >
                {labels.education}
              </h3>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index}>
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

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <h3 
                className="text-sm font-bold mb-4 uppercase tracking-wider pb-2 border-b-2"
                style={{ color: atsMode ? '#1a1a1a' : colors.primary, borderColor: atsMode ? '#e0e0e0' : colors.primary }}
              >
                Certifications
              </h3>
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <div 
                    key={index} 
                    className="p-2 border rounded"
                    style={{ borderColor: atsMode ? '#e0e0e0' : colors.primary + '30' }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-semibold text-gray-900">
                        {cert.title}
                      </h4>
                      {cert.date && (
                        <span className="text-xs text-gray-600">
                          {new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700">{cert.issuer}</p>
                    {cert.credentialId && (
                      <p className="text-xs text-gray-600 mt-1">ID: {cert.credentialId}</p>
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

export default LogosTemplate;
