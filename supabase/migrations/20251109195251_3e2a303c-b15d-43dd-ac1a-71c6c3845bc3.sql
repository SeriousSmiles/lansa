-- Seed resume templates with Fabric.js compatible design_json structures

INSERT INTO public.resume_templates (name, description, category, design_json, is_active, is_featured, thumbnail_url)
VALUES
  (
    'Modern Professional',
    'Clean and modern design perfect for tech and creative roles. Features a bold header with contact info and skills sidebar.',
    'modern',
    '{
      "version": "6.0.0",
      "objects": [
        {
          "type": "rect",
          "left": 0,
          "top": 0,
          "width": 794,
          "height": 120,
          "fill": "hsl(220, 13%, 13%)",
          "selectable": false
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 30,
          "width": 400,
          "text": "Your Name",
          "fontSize": 32,
          "fontFamily": "Inter",
          "fontWeight": "bold",
          "fill": "hsl(0, 0%, 100%)",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 75,
          "width": 400,
          "text": "Professional Title",
          "fontSize": 16,
          "fontFamily": "Inter",
          "fill": "hsl(215, 20%, 65%)",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 150,
          "width": 500,
          "text": "EXPERIENCE",
          "fontSize": 18,
          "fontFamily": "Inter",
          "fontWeight": "bold",
          "fill": "hsl(220, 13%, 13%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 190,
          "width": 500,
          "text": "Job Title | Company Name\nMonth Year - Present\n\n• Achievement or responsibility\n• Achievement or responsibility\n• Achievement or responsibility",
          "fontSize": 12,
          "fontFamily": "Inter",
          "fill": "hsl(220, 9%, 46%)",
          "editable": true
        },
        {
          "type": "rect",
          "left": 580,
          "top": 120,
          "width": 214,
          "height": 1003,
          "fill": "hsl(210, 40%, 96%)",
          "selectable": false
        },
        {
          "type": "textbox",
          "left": 600,
          "top": 150,
          "width": 174,
          "text": "CONTACT",
          "fontSize": 14,
          "fontFamily": "Inter",
          "fontWeight": "bold",
          "fill": "hsl(220, 13%, 13%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 600,
          "top": 180,
          "width": 174,
          "text": "email@example.com\n(555) 123-4567\nCity, State",
          "fontSize": 10,
          "fontFamily": "Inter",
          "fill": "hsl(220, 9%, 46%)",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 600,
          "top": 260,
          "width": 174,
          "text": "SKILLS",
          "fontSize": 14,
          "fontFamily": "Inter",
          "fontWeight": "bold",
          "fill": "hsl(220, 13%, 13%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 600,
          "top": 290,
          "width": 174,
          "text": "• Skill 1\n• Skill 2\n• Skill 3\n• Skill 4\n• Skill 5",
          "fontSize": 10,
          "fontFamily": "Inter",
          "fill": "hsl(220, 9%, 46%)",
          "editable": true
        }
      ]
    }'::jsonb,
    true,
    true,
    null
  ),
  (
    'Classic ATS',
    'ATS-friendly template with clean formatting. Optimized for applicant tracking systems with simple structure.',
    'ats',
    '{
      "version": "6.0.0",
      "objects": [
        {
          "type": "textbox",
          "left": 40,
          "top": 40,
          "width": 714,
          "text": "YOUR NAME",
          "fontSize": 28,
          "fontFamily": "Arial",
          "fontWeight": "bold",
          "fill": "hsl(220, 13%, 13%)",
          "textAlign": "center",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 80,
          "width": 714,
          "text": "email@example.com | (555) 123-4567 | City, State",
          "fontSize": 11,
          "fontFamily": "Arial",
          "fill": "hsl(220, 9%, 46%)",
          "textAlign": "center",
          "editable": true
        },
        {
          "type": "line",
          "left": 40,
          "top": 120,
          "x1": 0,
          "y1": 0,
          "x2": 714,
          "y2": 0,
          "stroke": "hsl(220, 13%, 13%)",
          "strokeWidth": 2,
          "selectable": false
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 140,
          "width": 714,
          "text": "PROFESSIONAL SUMMARY",
          "fontSize": 14,
          "fontFamily": "Arial",
          "fontWeight": "bold",
          "fill": "hsl(220, 13%, 13%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 170,
          "width": 714,
          "text": "Brief professional summary highlighting key qualifications and experience.",
          "fontSize": 11,
          "fontFamily": "Arial",
          "fill": "hsl(220, 9%, 46%)",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 230,
          "width": 714,
          "text": "WORK EXPERIENCE",
          "fontSize": 14,
          "fontFamily": "Arial",
          "fontWeight": "bold",
          "fill": "hsl(220, 13%, 13%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 260,
          "width": 714,
          "text": "Job Title | Company Name\nMonth Year - Present\n\n• Key achievement or responsibility\n• Key achievement or responsibility\n• Key achievement or responsibility",
          "fontSize": 11,
          "fontFamily": "Arial",
          "fill": "hsl(220, 9%, 46%)",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 400,
          "width": 714,
          "text": "EDUCATION",
          "fontSize": 14,
          "fontFamily": "Arial",
          "fontWeight": "bold",
          "fill": "hsl(220, 13%, 13%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 430,
          "width": 714,
          "text": "Degree Name | University Name\nGraduation Year",
          "fontSize": 11,
          "fontFamily": "Arial",
          "fill": "hsl(220, 9%, 46%)",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 520,
          "width": 714,
          "text": "SKILLS",
          "fontSize": 14,
          "fontFamily": "Arial",
          "fontWeight": "bold",
          "fill": "hsl(220, 13%, 13%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 550,
          "width": 714,
          "text": "Skill 1 • Skill 2 • Skill 3 • Skill 4 • Skill 5 • Skill 6",
          "fontSize": 11,
          "fontFamily": "Arial",
          "fill": "hsl(220, 9%, 46%)",
          "editable": true
        }
      ]
    }'::jsonb,
    true,
    false,
    null
  ),
  (
    'Creative Portfolio',
    'Eye-catching design for creative professionals. Features colorful accents and modern typography.',
    'creative',
    '{
      "version": "6.0.0",
      "objects": [
        {
          "type": "rect",
          "left": 0,
          "top": 0,
          "width": 200,
          "height": 1123,
          "fill": "hsl(280, 70%, 45%)",
          "selectable": false
        },
        {
          "type": "textbox",
          "left": 20,
          "top": 40,
          "width": 160,
          "text": "YOUR\nNAME",
          "fontSize": 32,
          "fontFamily": "Inter",
          "fontWeight": "bold",
          "fill": "hsl(0, 0%, 100%)",
          "lineHeight": 1.1,
          "editable": true
        },
        {
          "type": "textbox",
          "left": 20,
          "top": 140,
          "width": 160,
          "text": "Creative\nProfessional",
          "fontSize": 16,
          "fontFamily": "Inter",
          "fill": "hsl(280, 60%, 85%)",
          "lineHeight": 1.3,
          "editable": true
        },
        {
          "type": "textbox",
          "left": 20,
          "top": 220,
          "width": 160,
          "text": "CONTACT",
          "fontSize": 12,
          "fontFamily": "Inter",
          "fontWeight": "bold",
          "fill": "hsl(0, 0%, 100%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 20,
          "top": 250,
          "width": 160,
          "text": "email@example.com\n\n(555) 123-4567\n\nCity, State",
          "fontSize": 9,
          "fontFamily": "Inter",
          "fill": "hsl(280, 60%, 90%)",
          "lineHeight": 1.5,
          "editable": true
        },
        {
          "type": "textbox",
          "left": 20,
          "top": 380,
          "width": 160,
          "text": "SKILLS",
          "fontSize": 12,
          "fontFamily": "Inter",
          "fontWeight": "bold",
          "fill": "hsl(0, 0%, 100%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 20,
          "top": 410,
          "width": 160,
          "text": "Design\nIllustration\nBranding\nUI/UX\nPhotography",
          "fontSize": 9,
          "fontFamily": "Inter",
          "fill": "hsl(280, 60%, 90%)",
          "lineHeight": 1.8,
          "editable": true
        },
        {
          "type": "textbox",
          "left": 240,
          "top": 40,
          "width": 514,
          "text": "EXPERIENCE",
          "fontSize": 20,
          "fontFamily": "Inter",
          "fontWeight": "bold",
          "fill": "hsl(280, 70%, 45%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 240,
          "top": 85,
          "width": 514,
          "text": "Creative Director | Company Name\n2020 - Present",
          "fontSize": 13,
          "fontFamily": "Inter",
          "fontWeight": "600",
          "fill": "hsl(220, 13%, 13%)",
          "lineHeight": 1.5,
          "editable": true
        },
        {
          "type": "textbox",
          "left": 240,
          "top": 130,
          "width": 514,
          "text": "• Led creative team of 5 designers\n• Developed brand identity for major clients\n• Increased client satisfaction by 40%",
          "fontSize": 11,
          "fontFamily": "Inter",
          "fill": "hsl(220, 9%, 46%)",
          "lineHeight": 1.6,
          "editable": true
        },
        {
          "type": "textbox",
          "left": 240,
          "top": 250,
          "width": 514,
          "text": "EDUCATION",
          "fontSize": 20,
          "fontFamily": "Inter",
          "fontWeight": "bold",
          "fill": "hsl(280, 70%, 45%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 240,
          "top": 295,
          "width": 514,
          "text": "Bachelor of Fine Arts in Graphic Design\nUniversity Name | 2016",
          "fontSize": 11,
          "fontFamily": "Inter",
          "fill": "hsl(220, 9%, 46%)",
          "lineHeight": 1.6,
          "editable": true
        }
      ]
    }'::jsonb,
    true,
    false,
    null
  ),
  (
    'Executive Professional',
    'Sophisticated design for senior-level professionals. Clean layout with emphasis on leadership experience.',
    'professional',
    '{
      "version": "6.0.0",
      "objects": [
        {
          "type": "textbox",
          "left": 40,
          "top": 40,
          "width": 714,
          "text": "EXECUTIVE NAME",
          "fontSize": 36,
          "fontFamily": "Georgia",
          "fontWeight": "bold",
          "fill": "hsl(210, 50%, 25%)",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 90,
          "width": 714,
          "text": "Senior Executive | Industry Leader",
          "fontSize": 14,
          "fontFamily": "Georgia",
          "fontStyle": "italic",
          "fill": "hsl(210, 30%, 45%)",
          "editable": true
        },
        {
          "type": "line",
          "left": 40,
          "top": 130,
          "x1": 0,
          "y1": 0,
          "x2": 714,
          "y2": 0,
          "stroke": "hsl(210, 50%, 25%)",
          "strokeWidth": 1,
          "selectable": false
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 145,
          "width": 350,
          "text": "email@executive.com",
          "fontSize": 10,
          "fontFamily": "Georgia",
          "fill": "hsl(210, 30%, 45%)",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 404,
          "top": 145,
          "width": 350,
          "text": "(555) 123-4567 | City, State",
          "fontSize": 10,
          "fontFamily": "Georgia",
          "fill": "hsl(210, 30%, 45%)",
          "textAlign": "right",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 185,
          "width": 714,
          "text": "EXECUTIVE SUMMARY",
          "fontSize": 16,
          "fontFamily": "Georgia",
          "fontWeight": "bold",
          "fill": "hsl(210, 50%, 25%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 215,
          "width": 714,
          "text": "Distinguished executive with 15+ years of leadership experience driving organizational growth and innovation. Proven track record of strategic planning, team development, and delivering measurable results.",
          "fontSize": 11,
          "fontFamily": "Georgia",
          "fill": "hsl(220, 9%, 46%)",
          "lineHeight": 1.5,
          "editable": true
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 290,
          "width": 714,
          "text": "PROFESSIONAL EXPERIENCE",
          "fontSize": 16,
          "fontFamily": "Georgia",
          "fontWeight": "bold",
          "fill": "hsl(210, 50%, 25%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 325,
          "width": 550,
          "text": "Chief Executive Officer",
          "fontSize": 13,
          "fontFamily": "Georgia",
          "fontWeight": "bold",
          "fill": "hsl(220, 13%, 13%)",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 600,
          "top": 325,
          "width": 154,
          "text": "2018 - Present",
          "fontSize": 11,
          "fontFamily": "Georgia",
          "fill": "hsl(210, 30%, 45%)",
          "textAlign": "right",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 350,
          "width": 714,
          "text": "Company Name | City, State",
          "fontSize": 11,
          "fontFamily": "Georgia",
          "fontStyle": "italic",
          "fill": "hsl(210, 30%, 45%)",
          "editable": true
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 380,
          "width": 714,
          "text": "• Led company through 200% revenue growth over 5 years\n• Built and managed executive team of 12 senior leaders\n• Established strategic partnerships with Fortune 500 companies\n• Implemented operational excellence initiatives reducing costs by 30%",
          "fontSize": 11,
          "fontFamily": "Georgia",
          "fill": "hsl(220, 9%, 46%)",
          "lineHeight": 1.6,
          "editable": true
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 520,
          "width": 714,
          "text": "EDUCATION",
          "fontSize": 16,
          "fontFamily": "Georgia",
          "fontWeight": "bold",
          "fill": "hsl(210, 50%, 25%)",
          "editable": false
        },
        {
          "type": "textbox",
          "left": 40,
          "top": 555,
          "width": 714,
          "text": "Master of Business Administration (MBA)\nPrestigious University | Year",
          "fontSize": 11,
          "fontFamily": "Georgia",
          "fill": "hsl(220, 9%, 46%)",
          "lineHeight": 1.5,
          "editable": true
        }
      ]
    }'::jsonb,
    true,
    true,
    null
  );
