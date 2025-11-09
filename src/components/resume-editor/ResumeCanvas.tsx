import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Rect, Textbox, Line, FabricObject } from 'fabric';
import { ResumeDesign } from '@/hooks/resume/useResumeDesign';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResumeCanvasProps {
  design: ResumeDesign | null;
  canvasState: any;
  onCanvasStateChange: (state: any) => void;
}

export function ResumeCanvas({
  design,
  canvasState,
  onCanvasStateChange
}: ResumeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [zoom, setZoom] = useState(1);
  const { toast } = useToast();

  const createFabricObject = (objData: any): FabricObject | null => {
    try {
      switch (objData.type) {
        case 'rect':
          return new Rect({
            left: objData.left || 0,
            top: objData.top || 0,
            width: objData.width || 100,
            height: objData.height || 100,
            fill: objData.fill || '#000000',
            selectable: objData.selectable !== false,
          });

        case 'textbox':
          return new Textbox(objData.text || '', {
            left: objData.left || 0,
            top: objData.top || 0,
            width: objData.width || 200,
            fontSize: objData.fontSize || 16,
            fontFamily: objData.fontFamily || 'Arial',
            fontWeight: objData.fontWeight || 'normal',
            fontStyle: objData.fontStyle || 'normal',
            fill: objData.fill || '#000000',
            textAlign: objData.textAlign || 'left',
            lineHeight: objData.lineHeight || 1.16,
            editable: objData.editable !== false,
            selectable: objData.editable !== false,
          });

        case 'line':
          return new Line(
            [objData.x1 || 0, objData.y1 || 0, objData.x2 || 100, objData.y2 || 0],
            {
              left: objData.left || 0,
              top: objData.top || 0,
              stroke: objData.stroke || '#000000',
              strokeWidth: objData.strokeWidth || 1,
              selectable: objData.selectable !== false,
            }
          );

        default:
          console.warn(`Unknown object type: ${objData.type}`);
          return null;
      }
    } catch (error) {
      console.error('Error creating Fabric object:', error);
      return null;
    }
  };

  const renderDesignOnCanvas = (canvas: FabricCanvas, designJson: any) => {
    // Clear existing objects
    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    if (!designJson || !designJson.objects) {
      console.warn('No design objects to render');
      return;
    }

    // Create and add each object to canvas
    designJson.objects.forEach((objData: any) => {
      const fabricObj = createFabricObject(objData);
      if (fabricObj) {
        canvas.add(fabricObj);
      }
    });

    canvas.renderAll();
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric.js canvas
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;

    // Load design if exists
    if (design?.design_json) {
      try {
        renderDesignOnCanvas(canvas, design.design_json);
        toast({
          title: 'Template loaded',
          description: `Loaded template: ${design.name}`,
        });
      } catch (error) {
        console.error('Error rendering design:', error);
        toast({
          title: 'Error loading template',
          description: 'Failed to render template design',
          variant: 'destructive',
        });
      }
    }

    // Save canvas state when objects are modified
    canvas.on('object:modified', () => {
      if (onCanvasStateChange) {
        onCanvasStateChange(canvas.toJSON());
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [design]);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, 2);
    setZoom(newZoom);
    fabricCanvasRef.current?.setZoom(newZoom);
    fabricCanvasRef.current?.renderAll();
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);
    fabricCanvasRef.current?.setZoom(newZoom);
    fabricCanvasRef.current?.renderAll();
  };

  const handleResetZoom = () => {
    setZoom(1);
    fabricCanvasRef.current?.setZoom(1);
    fabricCanvasRef.current?.renderAll();
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
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-center min-h-full">
          <div className="shadow-2xl">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
