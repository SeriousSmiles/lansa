import { useState } from 'react';
import { ResumeTemplate } from '@/hooks/resume/useResumeTemplates';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';
import { getTemplateThumbnail } from '@/assets/templates';

interface TemplateLibraryProps {
  templates: ResumeTemplate[];
  selectedTemplate: ResumeTemplate | null;
  onSelectTemplate: (template: ResumeTemplate) => void;
}

export function TemplateLibrary({
  templates,
  selectedTemplate,
  onSelectTemplate
}: TemplateLibraryProps) {
  const categories = ['all', 'modern', 'professional', 'creative', 'ats'] as const;
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('all');

  const filteredTemplates = templates.filter(t =>
    activeCategory === 'all' || t.category === activeCategory
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Templates</h3>
        <p className="text-sm text-muted-foreground">
          Choose a template to start your resume
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            className="cursor-pointer capitalize"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg border-2",
              selectedTemplate?.id === template.id
                ? "border-primary shadow-md"
                : "border-transparent"
            )}
            onClick={() => onSelectTemplate(template)}
          >
            <div className="p-3">
              {/* Thumbnail */}
              <div className="aspect-[3/4] bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden">
                {getTemplateThumbnail(template.thumbnail_url) ? (
                  <img
                    src={getTemplateThumbnail(template.thumbnail_url)!}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  {template.is_featured && (
                    <Badge variant="secondary" className="text-xs">Featured</Badge>
                  )}
                </div>
                {template.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
