import { Users, Building, ArrowRight } from 'lucide-react';

interface GraphLegendProps {
  navigationMode: 'employees-first' | 'hospitals-first' | null;
}

export function GraphLegend({ navigationMode }: GraphLegendProps) {
  return (
    <div className="absolute top-4 left-4 glass-panel p-4 space-y-3">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Legend
      </h4>
      
      <div className="space-y-2">
        <LegendItem color="bg-primary" label="Entity Type" />
        <LegendItem color="bg-graph-employee" label="Employee" />
        <LegendItem color="bg-graph-hospital" label="Hospital" />
        <LegendItem color="bg-graph-claim" label="Claim" />
      </div>

      {navigationMode && (
        <div className="pt-2 border-t border-border/50">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Navigation Path
          </h4>
          <div className="flex items-center gap-2 text-xs text-foreground">
            {navigationMode === 'employees-first' ? (
              <>
                <Users className="w-3.5 h-3.5 text-graph-employee" />
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <Building className="w-3.5 h-3.5 text-graph-hospital" />
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-graph-claim">Claims</span>
              </>
            ) : (
              <>
                <Building className="w-3.5 h-3.5 text-graph-hospital" />
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <Users className="w-3.5 h-3.5 text-graph-employee" />
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-graph-claim">Claims</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
        <p>Click nodes to expand/collapse</p>
        <p>Drag to reposition</p>
        <p>Scroll to zoom</p>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-xs text-foreground">{label}</span>
    </div>
  );
}
