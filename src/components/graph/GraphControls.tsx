import { RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GraphControlsProps {
  onReset: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFit?: () => void;
  nodeCount: number;
  linkCount: number;
}

export function GraphControls({ 
  onReset, 
  onZoomIn, 
  onZoomOut, 
  onFit,
  nodeCount, 
  linkCount 
}: GraphControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-2">
      {/* Stats */}
      <div className="glass-panel px-3 py-2 text-xs font-mono text-muted-foreground">
        <span className="text-primary">{nodeCount}</span> nodes · <span className="text-secondary">{linkCount}</span> links
      </div>

      {/* Controls */}
      <div className="glass-panel flex items-center gap-1 p-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-muted"
          onClick={onReset}
          title="Reset Graph"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-muted"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-muted"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-muted"
          onClick={onFit}
          title="Fit to View"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
