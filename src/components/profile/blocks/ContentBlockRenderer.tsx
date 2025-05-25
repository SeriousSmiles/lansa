
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, Phone, Globe, Linkedin } from "lucide-react";

interface ContentBlockRendererProps {
  block: any;
  onEdit: () => void;
  onDelete: () => void;
}

export function ContentBlockRenderer({ block, onEdit, onDelete }: ContentBlockRendererProps) {
  const renderContent = () => {
    switch (block.block_type) {
      case 'about':
        return (
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{block.content.description}</p>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-lg">{block.content.position}</h4>
              <p className="text-[#FF6B4A] font-medium">{block.content.company}</p>
              <p className="text-gray-600 text-sm">
                {block.content.startDate} - {block.content.endDate || 'Present'}
              </p>
            </div>
            {block.content.description && (
              <p className="text-gray-700 whitespace-pre-wrap">{block.content.description}</p>
            )}
          </div>
        );

      case 'education':
        return (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-lg">{block.content.degree}</h4>
              <p className="text-[#FF6B4A] font-medium">{block.content.institution}</p>
              <p className="text-gray-600">{block.content.field}</p>
              <p className="text-gray-600 text-sm">
                {block.content.startYear} - {block.content.endYear}
              </p>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="flex flex-wrap gap-2">
            {(block.content.skills || []).map((skill: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-[#FF6B4A]/10 text-[#FF6B4A] border-[#FF6B4A]/20">
                {skill}
              </Badge>
            ))}
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-3">
            {block.content.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#FF6B4A]" />
                <a href={`mailto:${block.content.email}`} className="text-blue-600 hover:underline">
                  {block.content.email}
                </a>
              </div>
            )}
            {block.content.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#FF6B4A]" />
                <a href={`tel:${block.content.phone}`} className="text-blue-600 hover:underline">
                  {block.content.phone}
                </a>
              </div>
            )}
            {block.content.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#FF6B4A]" />
                <a href={block.content.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {block.content.website}
                </a>
              </div>
            )}
            {block.content.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-[#FF6B4A]" />
                <a href={block.content.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  LinkedIn Profile
                </a>
              </div>
            )}
          </div>
        );

      default:
        return <p className="text-gray-500">Unknown block type</p>;
    }
  };

  return (
    <Card className="relative group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-gray-800">
            {block.title || `${block.block_type.charAt(0).toUpperCase() + block.block_type.slice(1)}`}
          </CardTitle>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
