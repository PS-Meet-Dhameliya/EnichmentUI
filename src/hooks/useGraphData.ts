import { useState, useCallback, useMemo, useEffect } from 'react';
import { GraphNode, GraphLink } from '@/types/graph';
import {
  GenericDataset,
  NormalizedGenericData,
  normalizeGenericData,
  getRelatedEntities,
  getEntitiesByType
} from '@/utils/genericDataLoader';
import { assignEntityColors } from '@/utils/colorPalette';

interface GraphState {
  nodes: GraphNode[];
  links: GraphLink[];
  expandedNodes: Set<string>;
  selectedNode: GraphNode | null;
  selectedEntityType: string | null;
}

export function useGraphData(dataFile: string = 'example-3-entities.json') {
  const [dataset, setDataset] = useState<GenericDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load JSON file from public/data folder
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/data/${dataFile}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${dataFile}`);
        return res.json();
      })
      .then(data => {
        setDataset(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [dataFile]);

  const normalizedData = useMemo(() =>
    dataset ? normalizeGenericData(dataset) : null
    , [dataset]);

  // Auto-detect available entity types from data
  const availableEntities = useMemo(() => {
    if (!normalizedData) return [];

    return Array.from(normalizedData.entityTypes.entries()).map(([type, ids]) => ({
      id: type.toLowerCase(),
      label: type,
      count: ids.size
    }));
  }, [normalizedData]);

  // Assign colors to entity types
  const entityColors = useMemo(() => {
    if (!normalizedData) return {};
    const types = Array.from(normalizedData.entityTypes.keys());
    return assignEntityColors(types);
  }, [normalizedData]);

  const [state, setState] = useState<GraphState>(() => {
    return {
      nodes: [],
      links: [],
      expandedNodes: new Set<string>(),
      selectedNode: null,
      selectedEntityType: null,
    };
  });

  // Initialize graph when data loads
  useEffect(() => {
    if (!normalizedData || availableEntities.length === 0) return;

    const firstEntity = availableEntities[0];
    const rootNode: GraphNode = {
      id: `entity-${firstEntity.id}`,
      type: 'entity',
      label: firstEntity.label,
      data: { count: firstEntity.count },
      childCount: firstEntity.count,
      expanded: true, // Mark as expanded
    };

    // Auto-expand the root node to show all entities
    const { nodes: childNodes, links: childLinks } = expandNode(rootNode, normalizedData);

    setState({
      nodes: [rootNode, ...childNodes],
      links: childLinks,
      expandedNodes: new Set([rootNode.id]),
      selectedNode: null,
      selectedEntityType: firstEntity.id,
    });
  }, [normalizedData, availableEntities]);

  const toggleNode = useCallback((nodeId: string) => {
    if (!normalizedData) return;

    setState(prev => {
      const node = prev.nodes.find(n => n.id === nodeId);
      if (!node) return prev;

      const isExpanded = prev.expandedNodes.has(nodeId);
      const newExpandedNodes = new Set(prev.expandedNodes);
      let newNodes = [...prev.nodes];
      let newLinks = [...prev.links];

      if (isExpanded) {
        // Collapse: remove children recursively
        newExpandedNodes.delete(nodeId);
        const childIds = getChildNodeIds(nodeId, prev.nodes, prev.links);
        newNodes = newNodes.filter(n => !childIds.has(n.id));
        newLinks = newLinks.filter(l => {
          const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
          const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
          return !childIds.has(sourceId) && !childIds.has(targetId);
        });
      } else {
        // Expand based on node type
        newExpandedNodes.add(nodeId);
        const { nodes: childNodes, links: childLinks } = expandNode(
          node,
          normalizedData
        );

        newNodes = [...newNodes, ...childNodes];
        newLinks = [...newLinks, ...childLinks];
      }

      // Update expanded state on the node
      const targetNode = newNodes.find(n => n.id === nodeId);
      if (targetNode) {
        targetNode.expanded = !isExpanded;
      }

      return {
        ...prev,
        nodes: newNodes,
        links: newLinks,
        expandedNodes: newExpandedNodes,
      };
    });
  }, [normalizedData]);

  const selectNode = useCallback((node: GraphNode | null) => {
    setState(prev => ({ ...prev, selectedNode: node }));
  }, []);

  const setSelectedEntityType = useCallback((entityType: string) => {
    if (!normalizedData) return;

    const entity = availableEntities.find(e => e.id === entityType);
    if (!entity) return;

    const rootNode: GraphNode = {
      id: `entity-${entity.id}`,
      type: 'entity',
      label: entity.label,
      data: { count: entity.count },
      childCount: entity.count,
      expanded: true,
    };

    // Auto-expand the root node
    const { nodes: childNodes, links: childLinks } = expandNode(rootNode, normalizedData);

    setState({
      nodes: [rootNode, ...childNodes],
      links: childLinks,
      expandedNodes: new Set([rootNode.id]),
      selectedNode: null,
      selectedEntityType: entity.id,
    });
  }, [availableEntities, normalizedData]);

  const resetGraph = useCallback(() => {
    if (!state.selectedEntityType) return;
    setSelectedEntityType(state.selectedEntityType);
  }, [state.selectedEntityType, setSelectedEntityType]);

  return {
    nodes: state.nodes,
    links: state.links,
    selectedNode: state.selectedNode,
    expandedNodes: state.expandedNodes,
    selectedEntityType: state.selectedEntityType,
    availableEntities,
    entityColors,
    loading,
    error,
    metadata: dataset?.metadata,
    toggleNode,
    selectNode,
    resetGraph,
    setSelectedEntityType,
    normalizedData,
  };
}

// Helper function to get all child node IDs recursively
function getChildNodeIds(parentId: string, nodes: GraphNode[], links: GraphLink[]): Set<string> {
  const childIds = new Set<string>();

  links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    if (sourceId === parentId) {
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      childIds.add(targetId);
    }
  });

  childIds.forEach(childId => {
    const grandChildren = getChildNodeIds(childId, nodes, links);
    grandChildren.forEach(id => childIds.add(id));
  });

  return childIds;
}

function expandNode(
  node: GraphNode,
  data: NormalizedGenericData
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  if (node.type === 'entity') {
    // Expand root entity to show all instances of that type
    const entityType = node.label; // e.g., "Employee"
    const entities = getEntitiesByType(data, entityType);

    let index = 0;
    entities.forEach(entity => {
      const relCount = data.relationships.get(entity.id)?.length || 0;

      const angle = (index / entities.length) * 2 * Math.PI;
      const radius = 200;

      nodes.push({
        id: `${entityType.toLowerCase()}-${entity.id}`,
        type: entityType.toLowerCase(),
        label: entity.name,
        data: entity,
        childCount: relCount,
        parentId: node.id,
        x: (node.x || 0) + Math.cos(angle) * radius,
        y: (node.y || 0) + Math.sin(angle) * radius,
      });

      links.push({
        source: node.id,
        target: `${entityType.toLowerCase()}-${entity.id}`
      });

      index++;
    });
  } else {
    // Expand regular entity to show its relationships
    const entityId = node.id.split('-').slice(1).join('-'); // Handle IDs with dashes
    const relatedEntities = getRelatedEntities(data, entityId);

    let index = 0;
    relatedEntities.forEach(related => {
      const relCount = data.relationships.get(related.id)?.length || 0;
      const angle = (index / relatedEntities.length) * 2 * Math.PI;
      const radius = 150;

      nodes.push({
        id: `${related.type.toLowerCase()}-${related.id}`,
        type: related.type.toLowerCase(),
        label: related.name,
        data: related,
        childCount: relCount,
        parentId: node.id,
        x: (node.x || 0) + Math.cos(angle) * radius,
        y: (node.y || 0) + Math.sin(angle) * radius,
      });

      links.push({
        source: node.id,
        target: `${related.type.toLowerCase()}-${related.id}`,
        value: relCount
      });

      index++;
    });
  }

  return { nodes, links };
}
