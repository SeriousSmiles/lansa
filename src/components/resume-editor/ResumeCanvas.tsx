import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { SectionInstance, GlobalStyles } from '@/types/resumeSection';
import { ProfileDataReturn } from '@/hooks/useProfileData';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mapProfileToSection, calculateSectionHeight } from '@/lib/profileToCanvasMapper';
import { getSectionTemplate } from '@/lib/resumeSectionTemplates';

interface ResumeCanvasProps {
  sections: SectionInstance[];
  onSectionsChange: (sections: SectionInstance[]) => void;
  profileData: ProfileDataReturn;
  globalStyles: GlobalStyles;
  onAddSectionClick: () => void;
}

export function ResumeCanvas({
  sections,
  onSectionsChange,
  profileData,
  globalStyles,
  onAddSectionClick
}: ResumeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const { toast } = useToast();

  // A4 dimensions at 96 DPI
  const CANVAS_WIDTH = 794;
  const CANVAS_HEIGHT = 1123;

  const renderSectionsOnCanvas = (canvas: FabricCanvas) => {
    // Clear existing objects
    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    let currentY = 40; // Top margin

    // Sort sections by position
    const sortedSections = [...sections].sort((a, b) => a.position - b.position);

    sortedSections.forEach((section) => {
      if (!section.is_visible) return;

      try {
        const template = getSectionTemplate(section.component_type);
        const objects = mapProfileToSection(
          section.component_type,
          profileData,
          template,
          currentY
        );

        // Add all objects for this section
        objects.forEach((obj) => {
          canvas.add(obj);
        });

        // Calculate height for next section
        const sectionHeight = calculateSectionHeight(
          section.component_type,
          profileData,
          template
        );
        currentY += sectionHeight + 25; // 25px spacing between sections
      } catch (error) {
        console.error(`Error rendering section ${section.component_type}:`, error);
      }
    });

    // Add "Add Section" button area if there's space
    if (currentY < CANVAS_HEIGHT - 100) {
      // This will be replaced with a proper interactive element later
      // For now, just leave space
    }

    canvas.renderAll();
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric.js canvas
    const canvas = new FabricCanvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;

    // Initial render
    renderSectionsOnCanvas(canvas);

    // Save canvas state when objects are modified
    canvas.on('object:modified', () => {
      // Handle section updates here
      console.log('Canvas modified');
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  // Re-render when sections or profile data changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      renderSectionsOnCanvas(fabricCanvasRef.current);
    }
  }, [sections, profileData, globalStyles]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.3));
  };

  const handleResetZoom = () => {
    setZoom(0.8);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Canvas Controls */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetZoom}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
        
        <Button size="sm" onClick={onAddSectionClick}>
          <Plus className="w-4 h-4 mr-1" />
          Add Section
        </Button>
      </div>

      {/* Canvas Area with Zoom Container */}
      <div className="flex-1 overflow-auto p-8 bg-muted/30">
        <div className="flex items-center justify-center min-h-full">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out',
            }}
          >
            <div className="shadow-2xl bg-white" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Empty State Helper */}
      {sections.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4 max-w-md pointer-events-auto">
            <div className="text-muted-foreground text-lg">
              Start building your resume
            </div>
            <Button onClick={onAddSectionClick} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Section
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
