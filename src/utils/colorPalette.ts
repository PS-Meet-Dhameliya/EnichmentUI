const COLOR_PALETTE = [
    '#22d3ee', // cyan
    '#38bdf8', // sky
    '#34d399', // emerald
    '#a78bfa', // violet
    '#fbbf24', // amber
    '#f472b6', // pink
    '#fb923c', // orange
    '#a3e635', // lime
    '#60a5fa', // blue
    '#c084fc', // purple
];

export function assignEntityColors(entityTypes: string[]): Record<string, string> {
    const colors: Record<string, string> = {
        entity: '#22d3ee' // Root entity type
    };

    entityTypes.forEach((type, index) => {
        colors[type.toLowerCase()] = COLOR_PALETTE[index % COLOR_PALETTE.length];
    });

    return colors;
}

export function getColorForType(type: string, entityColors: Record<string, string>): string {
    return entityColors[type.toLowerCase()] || '#888888';
}
