import type { GenericDataset, NormalizedGenericData, GenericEntity, EntityRelationship } from '@/types/graph'

/**
 * Normalize generic dataset into efficient lookup structures
 */
export function normalizeGenericData(dataset: GenericDataset): NormalizedGenericData {
    const entities = new Map<string, GenericEntity>()
    const entityTypes = new Map<string, Set<string>>()
    const relationships = new Map<string, EntityRelationship[]>()

    // First pass: index all entities
    dataset.entities.forEach((entity: GenericEntity) => {
        entities.set(entity.id, entity)

        // Group by type
        if (!entityTypes.has(entity.type)) {
            entityTypes.set(entity.type, new Set())
        }
        entityTypes.get(entity.type)!.add(entity.id)

        // Index relationships
        if (entity.relationships) {
            relationships.set(entity.id, entity.relationships)
        }
    })

    return {
        entities,
        entityTypes,
        relationships
    }
}

/**
 * Get all entities of a specific type
 */
export function getEntitiesByType(
    data: NormalizedGenericData,
    type: string
): GenericEntity[] {
    const ids = data.entityTypes.get(type)
    if (!ids) return []

    return Array.from(ids)
        .map(id => data.entities.get(id))
        .filter((e): e is GenericEntity => e !== undefined)
}

/**
 * Get all entities related to a specific entity
 */
export function getRelatedEntities(
    data: NormalizedGenericData,
    entityId: string
): GenericEntity[] {
    const rels = data.relationships.get(entityId)
    if (!rels) return []

    return rels
        .map((rel: EntityRelationship) => data.entities.get(rel.id))
        .filter((e): e is GenericEntity => e !== undefined)
}

/**
 * Load and parse JSON data file
 */
export async function loadDataFile(url: string): Promise<GenericDataset> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to load ${url}`)
    }
    return response.json()
}
