import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Entity {
    id: string;
    label: string;
    count: number;
}

interface EntitySelectorProps {
    entities: Entity[];
    selectedEntity: string | null;
    onEntityChange: (entityId: string) => void;
}

export function EntitySelector({ entities, selectedEntity, onEntityChange }: EntitySelectorProps) {
    if (entities.length === 0) return null;

    return (
        <div className="absolute top-4 left-[220px] z-20 glass-panel px-4 py-3">
            <label className="text-xs text-muted-foreground mb-2 block font-medium">
                View Perspective
            </label>
            <Select value={selectedEntity || entities[0].id} onValueChange={onEntityChange}>
                <SelectTrigger className="w-[200px] bg-background/50 border-border/50">
                    <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                    {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                            <div className="flex items-center justify-between w-full">
                                <span>{entity.label}</span>
                                <span className="text-xs text-muted-foreground ml-2">({entity.count})</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
