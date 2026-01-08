import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GraphNode, GraphLink, EntityInfo, GenericDataset, NormalizedGenericData } from '@/types/graph'
import { normalizeGenericData, getEntitiesByType, getRelatedEntities } from '@/utils/dataLoader'
import { assignEntityColors } from '@/utils/colorPalette'
import { useToast } from '@/composables/useToast'

export const useGraphStore = defineStore('graph', () => {
    // State
    const nodes = ref<GraphNode[]>([])
    const links = ref<GraphLink[]>([])
    const expandedNodes = ref<Set<string>>(new Set())
    const selectedNode = ref<GraphNode | null>(null)
    const selectedEntityType = ref<string | null>(null)
    const normalizedData = ref<NormalizedGenericData | null>(null)
    const dataset = ref<GenericDataset | null>(null)
    const currentDataFile = ref<string>('example-3-entities.json') // Track current file
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const loadingProgress = ref(0) // 0-100 for progress indication
    
    const { success, error: showError } = useToast()

    // Computed
    const availableEntities = computed<EntityInfo[]>(() => {
        if (!normalizedData.value) return []

        return Array.from(normalizedData.value.entityTypes.entries()).map(([type, ids]) => ({
            id: type.toLowerCase(),
            label: type,
            count: ids.size
        }))
    })

    const entityColors = computed(() => {
        if (!normalizedData.value) return {}
        const types = Array.from(normalizedData.value.entityTypes.keys())
        return assignEntityColors(types)
    })

    const visibleNodes = computed(() => nodes.value.filter(n => n.x !== undefined))

    const nodeCount = computed(() => visibleNodes.value.length)
    const linkCount = computed(() => links.value.length)

    // Actions
    async function loadData(url: string) {
        isLoading.value = true
        error.value = null

        try {
            // Extract filename from URL
            const filename = url.split('/').pop() || 'example-3-entities.json'
            currentDataFile.value = filename

            // Fetch the file first
            loadingProgress.value = 10
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`Failed to load ${url}: ${response.statusText}`)
            }
            loadingProgress.value = 30
            const text = await response.text()
            loadingProgress.value = 50

            // Use Web Worker for parsing large files (prevents UI blocking)
            let data: GenericDataset
            if (text.length > 100000) { // Use worker for files > 100KB
                const worker = new Worker(
                    new URL('../workers/jsonParser.worker.ts', import.meta.url),
                    { type: 'module' }
                )

                data = await new Promise<GenericDataset>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        worker.terminate()
                        reject(new Error('Parsing timeout'))
                    }, 30000) // 30 second timeout

                    worker.onmessage = (e) => {
                        clearTimeout(timeout)
                        worker.terminate()
                        if (e.data.success) {
                            resolve(e.data.data)
                        } else {
                            reject(new Error(e.data.error))
                        }
                    }

                    worker.onerror = (error) => {
                        clearTimeout(timeout)
                        worker.terminate()
                        reject(error)
                    }

                    worker.postMessage({ action: 'parse', data: text })
                })
            } else {
                // Small files: parse directly
                data = JSON.parse(text)
            }

            // Clear previous data completely
            nodes.value = []
            links.value = []
            expandedNodes.value = new Set()
            selectedNode.value = null
            selectedEntityType.value = null
            
            // Load new data
            dataset.value = data
            loadingProgress.value = 80
            normalizedData.value = normalizeGenericData(data)
            loadingProgress.value = 100

            // Initialize with first entity type
            if (availableEntities.value.length > 0) {
                const firstEntity = availableEntities.value[0]
                setEntityType(firstEntity.id)
                success(`Loaded ${data.entities.length} entities from ${data.metadata.name}`)
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
            error.value = errorMessage
            showError(errorMessage)
            console.error('Failed to load data:', err)
        } finally {
            isLoading.value = false
            loadingProgress.value = 0
        }
    }

    function setEntityType(entityType: string) {
        if (!normalizedData.value) return

        const entity = availableEntities.value.find(e => e.id === entityType)
        if (!entity) return

        selectedEntityType.value = entity.id

        // Clear existing graph
        nodes.value = []
        links.value = []
        expandedNodes.value = new Set()

        // Create root node - will be centered by force simulation
        const rootNode: GraphNode = {
            id: `entity-${entity.id}`,
            type: 'entity',
            label: entity.label,
            data: { count: entity.count },
            childCount: entity.count,
            expanded: true,
        }

        // Auto-expand the root node
        const { nodes: childNodes, links: childLinks } = expandNode(rootNode)

        nodes.value = [rootNode, ...childNodes]
        links.value = childLinks
        expandedNodes.value = new Set([rootNode.id])
        selectedNode.value = null
    }

    function expandNode(node: GraphNode): { nodes: GraphNode[]; links: GraphLink[] } {
        if (!normalizedData.value) return { nodes: [], links: [] }

        const newNodes: GraphNode[] = []
        const newLinks: GraphLink[] = []
        
        // Track existing node IDs to prevent duplicates
        const existingNodeIds = new Set(nodes.value.map(n => n.id))
        const existingLinkKeys = new Set(
            links.value.map(l => {
                const sourceId = typeof l.source === 'string' ? l.source : l.source.id
                const targetId = typeof l.target === 'string' ? l.target : l.target.id
                return `${sourceId}-${targetId}`
            })
        )

        if (node.type === 'entity') {
            // Expand root entity to show all instances of that type
            const entityType = node.label
            const entities = getEntitiesByType(normalizedData.value, entityType)

            entities.forEach((entity, index) => {
                const nodeId = `${entityType.toLowerCase()}-${entity.id}`
                
                // Skip if node already exists
                if (existingNodeIds.has(nodeId)) return
                
                const relCount = normalizedData.value!.relationships.get(entity.id)?.length || 0

                const angle = (index / entities.length) * 2 * Math.PI
                const radius = 250 // Increased radius for better spacing

                newNodes.push({
                    id: nodeId,
                    type: entityType.toLowerCase(),
                    label: entity.name,
                    data: entity,
                    childCount: relCount,
                    parentId: node.id,
                    x: (node.x || 0) + Math.cos(angle) * radius,
                    y: (node.y || 0) + Math.sin(angle) * radius,
                })

                const linkKey = `${node.id}-${nodeId}`
                if (!existingLinkKeys.has(linkKey)) {
                    newLinks.push({
                        source: node.id,
                        target: nodeId
                    })
                }
            })
        } else {
            // Expand regular entity to show its relationships
            const entityId = node.id.split('-').slice(1).join('-')
            const relatedEntities = getRelatedEntities(normalizedData.value, entityId)

            relatedEntities.forEach((related, index) => {
                const nodeId = `${related.type.toLowerCase()}-${related.id}`
                
                // Skip if node already exists
                if (existingNodeIds.has(nodeId)) {
                    // But still create link if it doesn't exist
                    const linkKey = `${node.id}-${nodeId}`
                    if (!existingLinkKeys.has(linkKey)) {
                        newLinks.push({
                            source: node.id,
                            target: nodeId,
                            value: normalizedData.value!.relationships.get(related.id)?.length || 0
                        })
                    }
                    return
                }
                
                const relCount = normalizedData.value!.relationships.get(related.id)?.length || 0
                const angle = (index / relatedEntities.length) * 2 * Math.PI
                const radius = 180 // Increased radius for better spacing

                newNodes.push({
                    id: nodeId,
                    type: related.type.toLowerCase(),
                    label: related.name,
                    data: related,
                    childCount: relCount,
                    parentId: node.id,
                    x: (node.x || 0) + Math.cos(angle) * radius,
                    y: (node.y || 0) + Math.sin(angle) * radius,
                })

                const linkKey = `${node.id}-${nodeId}`
                if (!existingLinkKeys.has(linkKey)) {
                    newLinks.push({
                        source: node.id,
                        target: nodeId,
                        value: relCount
                    })
                }
            })
        }

        return { nodes: newNodes, links: newLinks }
    }

    function toggleNode(nodeId: string) {
        const node = nodes.value.find(n => n.id === nodeId)
        if (!node) return

        const isExpanded = expandedNodes.value.has(nodeId)

        if (isExpanded) {
            // Collapse: remove children recursively
            expandedNodes.value.delete(nodeId)
            const childIds = getChildNodeIds(nodeId)
            nodes.value = nodes.value.filter(n => !childIds.has(n.id))
            links.value = links.value.filter(l => {
                const sourceId = typeof l.source === 'string' ? l.source : l.source.id
                const targetId = typeof l.target === 'string' ? l.target : l.target.id
                return !childIds.has(sourceId) && !childIds.has(targetId)
            })
            node.expanded = false
        } else {
            // Expand
            expandedNodes.value.add(nodeId)
            const { nodes: childNodes, links: childLinks } = expandNode(node)
            
            // Filter out any duplicates that might have been created
            const existingIds = new Set(nodes.value.map(n => n.id))
            const uniqueChildNodes = childNodes.filter(n => !existingIds.has(n.id))
            
            nodes.value = [...nodes.value, ...uniqueChildNodes]
            links.value = [...links.value, ...childLinks]
            node.expanded = true
        }
    }

    function getChildNodeIds(parentId: string): Set<string> {
        const childIds = new Set<string>()

        links.value.forEach(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id
            if (sourceId === parentId) {
                const targetId = typeof link.target === 'string' ? link.target : link.target.id
                childIds.add(targetId)
            }
        })

        childIds.forEach(childId => {
            const grandChildren = getChildNodeIds(childId)
            grandChildren.forEach(id => childIds.add(id))
        })

        return childIds
    }

    function selectNode(node: GraphNode | null) {
        selectedNode.value = node
    }

    function resetGraph() {
        if (!selectedEntityType.value) return
        setEntityType(selectedEntityType.value)
    }

    return {
        // State
        nodes,
        links,
        expandedNodes,
        selectedNode,
        selectedEntityType,
        availableEntities,
        entityColors,
        isLoading,
        loadingProgress,
        error,
        dataset,
        currentDataFile,
        // Computed
        visibleNodes,
        nodeCount,
        linkCount,
        // Actions
        loadData,
        setEntityType,
        toggleNode,
        selectNode,
        resetGraph,
    }
})
