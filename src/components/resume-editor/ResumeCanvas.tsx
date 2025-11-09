import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { ResumeDesign } from '@/hooks/resume/useResumeDesign';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

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
      // TODO: Parse and render design_json layers
      console.log('Loading design:', design.id);
    }

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
