import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataFileSelectorProps {
    selectedFile: string;
    onFileChange: (file: string) => void;
}

const AVAILABLE_FILES = [
    { id: 'example-3-entities.json', label: 'Insurance Data (3 entities)' },
    { id: 'example-4-entities.json', label: 'HR Data (4 entities)' },
];

export function DataFileSelector({ selectedFile, onFileChange }: DataFileSelectorProps) {
    return (
        <div className="absolute top-4 right-4 z-20 glass-panel px-4 py-3">
            <label className="text-xs text-muted-foreground mb-2 block font-medium">
                Data Source
            </label>
            <Select value={selectedFile} onValueChange={onFileChange}>
                <SelectTrigger className="w-[250px] bg-background/50 border-border/50">
                    <SelectValue placeholder="Select data file" />
                </SelectTrigger>
                <SelectContent>
                    {AVAILABLE_FILES.map((file) => (
                        <SelectItem key={file.id} value={file.id}>
                            {file.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
