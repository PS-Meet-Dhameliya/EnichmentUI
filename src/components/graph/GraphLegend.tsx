import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EntityInfo {
  id: string;
  label: string;
  count: number;
}

interface GraphLegendProps {
  entities: EntityInfo[];
  entityColors: Record<string, string>;
  selectedFile: string;
  onFileChange: (file: string) => void;
}

const AVAILABLE_FILES = [
  { id: 'example-3-entities.json', label: 'Insurance Data (3 entities)' },
  { id: 'example-4-entities.json', label: 'HR Data (4 entities)' },
  { id: 'car_details.json', label: 'Suzuki Car Sales (4 entities)' },
];

export function GraphLegend({ entities, entityColors, selectedFile, onFileChange }: GraphLegendProps) {
  return (
    <div className="absolute top-4 left-4 glass-panel p-4 space-y-4 min-w-[240px]">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Legend
      </h4>

      {/* Entity Types */}
      <div className="space-y-2">
        {entities.map((entity) => (
          <LegendItem
            key={entity.id}
            color={entityColors[entity.id] || entityColors['entity'] || '#888'}
            label={entity.label}
            count={entity.count}
          />
        ))}
      </div>

      {/* Data Source Selector */}
      <div className="pt-2 border-t border-border/50">
        <label className="text-xs text-muted-foreground mb-2 block font-medium uppercase tracking-wider">
          Data Source
        </label>
        <Select value={selectedFile} onValueChange={onFileChange}>
          <SelectTrigger className="w-full bg-background/50 border-border/50 h-8 text-xs">
            <SelectValue placeholder="Select data file" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_FILES.map((file) => (
              <SelectItem key={file.id} value={file.id} className="text-xs">
                {file.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Instructions */}
      <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground space-y-1">
        <p>Click nodes to expand/collapse</p>
        <p>Drag to reposition</p>
        <p>Scroll to zoom</p>
      </div>
    </div>
  );
}

function LegendItem({ color, label, count }: { color: string; label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-foreground">
        {label}
        {count !== undefined && <span className="text-muted-foreground ml-1">({count})</span>}
      </span>
    </div>
  );
}
