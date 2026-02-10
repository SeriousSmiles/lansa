import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Rect } from 'fabric';
import { SectionInstance, GlobalStyles, LayoutStructure, SectionBounds } from '@/types/resumeSection';
import { ProfileDataReturn } from '@/hooks/useProfileData';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mapProfileToSection } from '@/lib/profileToCanvasMapper';
import { getSectionTemplate } from '@/lib/resumeSectionTemplates';
import { ResumeLayoutEngine } from '@/lib/resumeLayoutEngine';

interface ResumeCanvasProps {
  sections: SectionInstance[];
  onSectionsChange: (sections: SectionInstance[]) => void;
  profileData: ProfileDataReturn;
  globalStyles: GlobalStyles;
  layoutStructure: LayoutStructure;
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string | null) => void;
  onAddSectionClick: () => void;
}

export function ResumeCanvas({
  sections,
  onSectionsChange,
  profileData,
  globalStyles,
  layoutStructure,
  selectedSectionId,
  onSectionSelect,
  onAddSectionClick
}: ResumeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const sectionBoundsRef = useRef<Map<string, SectionBounds>>(new Map());
  const highlightRef = useRef<Rect | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const { toast } = useToast();

  // A4 dimensions at 96 DPI
  const CANVAS_WIDTH = 794;
  const CANVAS_HEIGHT = 1123;

  const clearHighlight = (canvas: FabricCanvas) => {
    if (highlightRef.current) {
      canvas.remove(highlightRef.current);
      highlightRef.current = null;
    }
  };

  const highlightSection = (canvas: FabricCanvas, sectionId: string, bounds: SectionBounds) => {
    clearHighlight(canvas);
    
    const highlight = new Rect({
      left: bounds.x - 5,
      top: bounds.y - 5,
      width: bounds.width + 10,
      height: bounds.height + 10,
      fill: 'transparent',
      stroke: 'hsl(var(--primary))',
      strokeWidth: 2,
      selectable: false,
      evented: false,
      strokeDashArray: [5, 5]
    });
    
    canvas.add(highlight);
    highlightRef.current = highlight;
    canvas.renderAll();
  };

  const renderSectionsOnCanvas = (canvas: FabricCanvas) => {
    // Clear existing objects
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    sectionBoundsRef.current.clear();

    // Use layout engine to calculate positions
    const layoutEngine = new ResumeLayoutEngine();
    const sectionBounds = layoutEngine.calculateLayout(
      sections,
      layoutStructure,
      profileData
    );

    // Render each section at calculated position
    sectionBounds.forEach((bounds, sectionId) => {
      const section = sections.find(s => s.id === sectionId);
      if (!section || !section.is_visible) return;

      try {
        const template = getSectionTemplate(section.component_type);
        const objects = mapProfileToSection(
          section.component_type,
          profileData,
          template,
          0 // Y offset handled by bounds
        );

        // Adjust positions for zone and bounds
        const fabricObjects: any[] = [];
        objects.forEach((obj) => {
          if (obj.left !== undefined) {
            obj.left += bounds.x;
          }
          if (obj.top !== undefined) {
            obj.top += bounds.y;
          }
          
          // Apply responsive font sizing
          if (obj.type === 'textbox' && 'fontSize' in obj && typeof obj.fontSize === 'number') {
            (obj as any).fontSize = layoutEngine.getResponsiveFontSize(obj.fontSize, bounds.width);
          }
          
          canvas.add(obj);
          fabricObjects.push(obj);
        });

        // Store bounds with fabric objects for click detection
        sectionBoundsRef.current.set(sectionId, {
          ...bounds,
          fabricObjects
        });
      } catch (error) {
        console.error(`Error rendering section ${section.component_type}:`, error);
      }
    });

    // Highlight selected section if any
    if (selectedSectionId && sectionBoundsRef.current.has(selectedSectionId)) {
      const bounds = sectionBoundsRef.current.get(selectedSectionId)!;
      highlightSection(canvas, selectedSectionId, bounds);
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

    // Handle canvas clicks for section selection
    canvas.on('mouse:down', (event) => {
      const pointer = canvas.getPointer(event.e);
      
      // Find which section was clicked
      let clickedSectionId: string | null = null;
      
      for (const [sectionId, bounds] of sectionBoundsRef.current.entries()) {
        if (
          pointer.x >= bounds.x &&
          pointer.x <= bounds.x + bounds.width &&
          pointer.y >= bounds.y &&
          pointer.y <= bounds.y + bounds.height
        ) {
          clickedSectionId = sectionId;
          break;
        }
      }
      
      onSectionSelect(clickedSectionId);
      
      if (clickedSectionId && sectionBoundsRef.current.has(clickedSectionId)) {
        const bounds = sectionBoundsRef.current.get(clickedSectionId)!;
        highlightSection(canvas, clickedSectionId, bounds);
      } else {
        clearHighlight(canvas);
      }
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  // Re-render when sections, layout, or profile data changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      renderSectionsOnCanvas(fabricCanvasRef.current);
    }
  }, [sections, profileData, globalStyles, layoutStructure, selectedSectionId]);

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
            <div data-resume-canvas className="shadow-2xl bg-white" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
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
