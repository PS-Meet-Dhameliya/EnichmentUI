/**
 * Dynamic color palette for entity types
 * Assigns colors from a predefined palette to entity types
 */

const COLOR_PALETTE = [
    '#21d5ed',  // Cyan (default) - was hsl(187 85% 53%)
    '#4f7cff',  // Blue - was hsl(217 91% 60%)
    '#16a34a',  // Green - was hsl(142 76% 36%)
    '#f97316',  // Orange - was hsl(25 95% 53%)
    '#a855f7',  // Purple - was hsl(262 83% 58%)
    '#ec4899',  // Pink - was hsl(340 82% 52%)
    '#facc15',  // Yellow - was hsl(48 96% 53%)
    '#14b8a6',  // Teal - was hsl(168 76% 42%)
]

/**
 * Assign colors to entity types
 */
export function assignEntityColors(entityTypes: string[]): Record<string, string> {
    const colors: Record<string, string> = {}

    entityTypes.forEach((type, index) => {
        colors[type.toLowerCase()] = COLOR_PALETTE[index % COLOR_PALETTE.length]
    })

    // Always have an 'entity' color for root nodes
    colors['entity'] = COLOR_PALETTE[0]

    return colors
}
