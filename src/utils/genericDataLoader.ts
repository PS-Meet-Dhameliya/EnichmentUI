export interface GenericEntity {
    type: string;
    id: string;
    name: string;
    [key: string]: any; // Additional attributes
    relationships?: Array<{ type: string; id: string }>;
}

export interface GenericDataset {
    metadata?: {
        name: string;
        description?: string;
    };
    entities: GenericEntity[];
}

export interface NormalizedGenericData {
    entityTypes: Map<string, Set<string>>; // type -> Set of IDs
    entities: Map<string, GenericEntity>; // id -> entity
    relationships: Map<string, Array<{ type: string; id: string }>>; // id -> relationships
}

export function normalizeGenericData(dataset: GenericDataset): NormalizedGenericData {
    const entityTypes = new Map<string, Set<string>>();
    const entities = new Map<string, GenericEntity>();
    const relationships = new Map<string, Array<{ type: string; id: string }>>();

    dataset.entities.forEach(entity => {
        // Track entity types
        if (!entityTypes.has(entity.type)) {
            entityTypes.set(entity.type, new Set());
        }
        entityTypes.get(entity.type)!.add(entity.id);

        // Store entity
        entities.set(entity.id, entity);

        // Store relationships
        if (entity.relationships && entity.relationships.length > 0) {
            relationships.set(entity.id, entity.relationships);
        }
    });

    return { entityTypes, entities, relationships };
}

export function getRelatedEntities(
    data: NormalizedGenericData,
    entityId: string,
    targetType?: string
): GenericEntity[] {
    const rels = data.relationships.get(entityId) || [];
    return rels
        .filter(rel => !targetType || rel.type === targetType)
        .map(rel => data.entities.get(rel.id))
        .filter(Boolean) as GenericEntity[];
}

export function getEntityById(
    data: NormalizedGenericData,
    entityId: string
): GenericEntity | undefined {
    return data.entities.get(entityId);
}

export function getEntitiesByType(
    data: NormalizedGenericData,
    type: string
): GenericEntity[] {
    const ids = data.entityTypes.get(type) || new Set();
    return Array.from(ids)
        .map(id => data.entities.get(id))
        .filter(Boolean) as GenericEntity[];
}
