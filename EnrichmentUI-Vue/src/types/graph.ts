// Generic graph types for force-directed visualization

export type NodeType = string

export interface GraphNode {
    id: string
    type: NodeType
    label: string
    data: Record<string, unknown>
    parentId?: string
    childCount?: number
    expanded?: boolean
    // D3 force simulation adds these properties
    x?: number
    y?: number
    vx?: number
    vy?: number
    fx?: number | null
    fy?: number | null
    // Index signature for SpatialItem compatibility
    [key: string]: unknown
}

export interface GraphLink {
    source: string | GraphNode
    target: string | GraphNode
    label?: string
    value?: number
}

export interface GraphData {
    nodes: GraphNode[]
    links: GraphLink[]
}

// Generic dataset structure
export interface GenericEntity {
    type: string
    id: string
    name: string
    [key: string]: unknown
    relationships?: EntityRelationship[]
}

export interface EntityRelationship {
    type: string
    id: string
}

export interface GenericDataset {
    metadata: {
        name: string
        description: string
    }
    entities: GenericEntity[]
}

// Normalized data structure
export interface NormalizedGenericData {
    entities: Map<string, GenericEntity>
    entityTypes: Map<string, Set<string>>
    relationships: Map<string, EntityRelationship[]>
}

// Entity info for UI
export interface EntityInfo {
    id: string
    label: string
    count: number
}
