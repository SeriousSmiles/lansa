import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Edge function invoked: generate-pdf-puppeteer');
    
    const { template, data, filename } = await req.json();
    console.log('Request data:', { template, filename });

    // Generate HTML content based on template
    const htmlContent = generateHTMLTemplate(template, data);
    
    // Launch Puppeteer
    const puppeteer = await import('https://deno.land/x/puppeteer@16.2.0/mod.ts');
    
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set content and wait for fonts/styles to load
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });

    await browser.close();

    console.log('PDF generated successfully');

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'resume.pdf'}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate PDF',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateHTMLTemplate(template: string, data: any): string {
  const { personalInfo, experience, education, skills, colors } = data;
  
  const baseStyles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
        color: #1f2937;
        background: white;
      }
      
      .resume-container {
        max-width: 8.5in;
        margin: 0 auto;
        background: white;
        min-height: 11in;
      }
      
      .header {
        padding: 2rem;
        background: ${colors?.primary || '#3b82f6'};
        color: white;
      }
      
      .name {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }
      
      .title {
        font-size: 1.25rem;
        opacity: 0.9;
        margin-bottom: 1rem;
      }
      
      .contact-info {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
      
      .contact-item {
        opacity: 0.9;
      }
      
      .content {
        padding: 2rem;
      }
      
      .section {
        margin-bottom: 2rem;
      }
      
      .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: ${colors?.primary || '#3b82f6'};
        border-bottom: 2px solid ${colors?.primary || '#3b82f6'};
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
      }
      
      .experience-item, .education-item {
        margin-bottom: 1.5rem;
        page-break-inside: avoid;
      }
      
      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 0.5rem;
      }
      
      .item-title {
        font-weight: 600;
        font-size: 1.1rem;
      }
      
      .item-company {
        color: ${colors?.primary || '#3b82f6'};
        font-weight: 500;
      }
      
      .item-date {
        color: #6b7280;
        font-size: 0.9rem;
      }
      
      .item-description {
        margin-top: 0.5rem;
        line-height: 1.7;
      }
      
      .skills-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.5rem;
      }
      
      .skill-tag {
        background: ${colors?.secondary || '#f3f4f6'};
        color: ${colors?.primary || '#3b82f6'};
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        text-align: center;
      }
      
      .summary {
        line-height: 1.7;
        margin-bottom: 1rem;
      }
      
      .professional-goal {
        background: ${colors?.secondary || '#f3f4f6'};
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 4px solid ${colors?.primary || '#3b82f6'};
        margin-bottom: 1rem;
      }
      
      @media print {
        body { print-color-adjust: exact; }
        .resume-container { box-shadow: none; }
      }
    </style>
  `;

  const modernTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${personalInfo?.name || 'Resume'}</title>
      ${baseStyles}
    </head>
    <body>
      <div class="resume-container">
        <div class="header">
          <h1 class="name">${personalInfo?.name || 'Your Name'}</h1>
          <p class="title">${personalInfo?.title || 'Professional Title'}</p>
          <div class="contact-info">
            ${personalInfo?.email ? `<span class="contact-item">📧 ${personalInfo.email}</span>` : ''}
            ${personalInfo?.phone ? `<span class="contact-item">📱 ${personalInfo.phone}</span>` : ''}
          </div>
        </div>
        
        <div class="content">
          ${personalInfo?.summary ? `
            <div class="section">
              <h2 class="section-title">Summary</h2>
              <p class="summary">${personalInfo.summary}</p>
            </div>
          ` : ''}
          
          ${personalInfo?.professionalGoal ? `
            <div class="section">
              <h2 class="section-title">Professional Goal</h2>
              <div class="professional-goal">
                <p>${personalInfo.professionalGoal}</p>
              </div>
            </div>
          ` : ''}
          
          ${experience?.length ? `
            <div class="section">
              <h2 class="section-title">Experience</h2>
              ${experience.map(exp => `
                <div class="experience-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${exp.title || 'Position Title'}</div>
                      <div class="item-company">${exp.company || 'Company Name'}</div>
                    </div>
                    <div class="item-date">${exp.startYear || ''} - ${exp.endYear || 'Present'}</div>
                  </div>
                  ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${education?.length ? `
            <div class="section">
              <h2 class="section-title">Education</h2>
              ${education.map(edu => `
                <div class="education-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${edu.degree || 'Degree'}</div>
                      <div class="item-company">${edu.institution || 'Institution'}</div>
                    </div>
                    <div class="item-date">${edu.startYear || ''} - ${edu.endYear || 'Present'}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${skills?.length ? `
            <div class="section">
              <h2 class="section-title">Skills</h2>
              <div class="skills-grid">
                ${skills.map(skill => `<div class="skill-tag">${skill}</div>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  return modernTemplate;
}