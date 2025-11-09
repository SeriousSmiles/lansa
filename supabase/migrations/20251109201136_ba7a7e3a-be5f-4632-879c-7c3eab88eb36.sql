-- Update resume template thumbnails with generated images
-- Note: These paths will need to be converted to actual URLs after images are imported in the app

UPDATE resume_templates
SET thumbnail_url = '/src/assets/templates/modern-professional-thumb.png'
WHERE name = 'Modern Professional';

UPDATE resume_templates
SET thumbnail_url = '/src/assets/templates/executive-professional-thumb.png'
WHERE name = 'Executive Professional';

UPDATE resume_templates
SET thumbnail_url = '/src/assets/templates/classic-ats-thumb.png'
WHERE name = 'Classic ATS';

UPDATE resume_templates
SET thumbnail_url = '/src/assets/templates/creative-portfolio-thumb.png'
WHERE name = 'Creative Portfolio';