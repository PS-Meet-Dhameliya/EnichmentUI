import { useState, useCallback, useMemo } from 'react';
import { GraphNode, GraphLink, NormalizedData, EmployeeData, InsuranceClaim } from '@/types/graph';
import {
  normalizeEmployeeData,
  getHospitalsByEmployee,
  getEmployeesByHospital,
  getClaimsByEmployeeAndHospital
} from '@/utils/normalizeData';
import { sampleEmployees } from '@/data/sampleData';

type NavigationMode = 'employees-first' | 'hospitals-first';

interface GraphState {
  nodes: GraphNode[];
  links: GraphLink[];
  expandedNodes: Set<string>;
  selectedNode: GraphNode | null;
  navigationMode: NavigationMode | null;
  selectedEntityType: string | null;
}

export function useGraphData() {
  const normalizedData = useMemo(() => normalizeEmployeeData(sampleEmployees), []);

  // Get available entity types dynamically from data
  const availableEntities = useMemo(() => {
    const entities: Array<{ id: string; label: string; count: number }> = [];

    if (normalizedData.employees.size > 0) {
      entities.push({
        id: 'employees',
        label: 'Employees',
        count: normalizedData.employees.size
      });
    }

    if (normalizedData.hospitals.size > 0) {
      entities.push({
        id: 'hospitals',
        label: 'Hospitals',
        count: normalizedData.hospitals.size
      });
    }

    return entities;
  }, [normalizedData]);

  const [state, setState] = useState<GraphState>(() => {
    // Initialize with first available entity
    const firstEntity = availableEntities[0];
    if (!firstEntity) {
      return {
        nodes: [],
        links: [],
        expandedNodes: new Set<string>(),
        selectedNode: null,
        navigationMode: null,
        selectedEntityType: null,
      };
    }

    return {
      nodes: [
        {
          id: `entity-${firstEntity.id}`,
          type: 'entity',
          label: firstEntity.label,
          data: { count: firstEntity.count },
          childCount: firstEntity.count,
        },
      ],
      links: [],
      expandedNodes: new Set<string>(),
      selectedNode: null,
      navigationMode: firstEntity.id === 'employees' ? 'employees-first' : 'hospitals-first',
      selectedEntityType: firstEntity.id,
    };
  });

  const toggleNode = useCallback((nodeId: string) => {
    setState(prev => {
      const node = prev.nodes.find(n => n.id === nodeId);
      if (!node) return prev;

      const isExpanded = prev.expandedNodes.has(nodeId);
      const newExpandedNodes = new Set(prev.expandedNodes);
      let newNodes = [...prev.nodes];
      let newLinks = [...prev.links];
      let newNavigationMode = prev.navigationMode;

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

        // Reset navigation mode if collapsing entity
        if (nodeId === 'entity-employees' || nodeId === 'entity-hospitals') {
          newNavigationMode = null;
        }
      } else {
        // Expand based on node type
        newExpandedNodes.add(nodeId);
        const { nodes: childNodes, links: childLinks } = expandNode(
          node,
          normalizedData,
          prev.navigationMode
        );

        // Set navigation mode when expanding entity
        if (nodeId === 'entity-employees') {
          newNavigationMode = 'employees-first';
        } else if (nodeId === 'entity-hospitals') {
          newNavigationMode = 'hospitals-first';
        }

        newNodes = [...newNodes, ...childNodes];
        newLinks = [...newLinks, ...childLinks];
      }

      // Update expanded state on the node (in-place to preserve object references for force simulation)
      const targetNode = newNodes.find(n => n.id === nodeId);
      if (targetNode) {
        targetNode.expanded = !isExpanded;
      }

      return {
        ...prev,
        nodes: newNodes,
        links: newLinks,
        expandedNodes: newExpandedNodes,
        navigationMode: newNavigationMode,
      };
    });
  }, [normalizedData]);

  const selectNode = useCallback((node: GraphNode | null) => {
    setState(prev => ({ ...prev, selectedNode: node }));
  }, []);

  const setSelectedEntityType = useCallback((entityType: string) => {
    const entity = availableEntities.find(e => e.id === entityType);
    if (!entity) return;

    setState({
      nodes: [
        {
          id: `entity-${entity.id}`,
          type: 'entity',
          label: entity.label,
          data: { count: entity.count },
          childCount: entity.count,
        },
      ],
      links: [],
      expandedNodes: new Set<string>(),
      selectedNode: null,
      navigationMode: entity.id === 'employees' ? 'employees-first' : 'hospitals-first',
      selectedEntityType: entity.id,
    });
  }, [availableEntities]);

  const resetGraph = useCallback(() => {
    if (!state.selectedEntityType) return;
    setSelectedEntityType(state.selectedEntityType);
  }, [state.selectedEntityType, setSelectedEntityType]);

  return {
    nodes: state.nodes,
    links: state.links,
    selectedNode: state.selectedNode,
    expandedNodes: state.expandedNodes,
    navigationMode: state.navigationMode,
    selectedEntityType: state.selectedEntityType,
    availableEntities,
    toggleNode,
    selectNode,
    resetGraph,
    setSelectedEntityType,
    normalizedData,
  };
}

function getChildNodeIds(parentId: string, nodes: GraphNode[], links: GraphLink[]): Set<string> {
  const childIds = new Set<string>();
  const directChildren = links
    .filter(l => {
      const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      return sourceId === parentId;
    })
    .map(l => typeof l.target === 'string' ? l.target : (l.target as any).id);

  directChildren.forEach(childId => {
    childIds.add(childId);
    // Recursively get grandchildren
    const grandChildren = getChildNodeIds(childId, nodes, links);
    grandChildren.forEach(id => childIds.add(id));
  });

  return childIds;
}

function expandNode(
  node: GraphNode,
  data: NormalizedData,
  navigationMode: NavigationMode | null
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  switch (node.type) {
    case 'entity': {
      if (node.id.includes('employees')) {
        // Expand to show all employees
        let index = 0;
        data.employees.forEach((emp, id) => {
          const hospitals = getHospitalsByEmployee(data, id);
          // Calculate initial position in a circle around parent
          const angle = (index / data.employees.size) * 2 * Math.PI;
          const radius = 200; // Distance from parent
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius;

          nodes.push({
            id: `employee-${id}`,
            type: 'employee',
            label: `${emp.personalDetails.firstName} ${emp.personalDetails.lastName}`,
            data: { ...emp },
            parentId: node.id,
            childCount: hospitals.length,
            // Set initial position relative to parent
            x: (node.x || 0) + offsetX,
            y: (node.y || 0) + offsetY,
          });
          links.push({ source: node.id, target: `employee-${id}` });
          index++;
        });
      } else if (node.id.includes('hospitals')) {
        // Expand to show all hospitals
        let index = 0;
        const hospitalArray = Array.from(data.hospitals.entries());
        hospitalArray.forEach(([name, hospital]) => {
          // Calculate initial position in a circle around parent
          const angle = (index / hospitalArray.length) * 2 * Math.PI;
          const radius = 200;
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius;

          nodes.push({
            id: `hospital-${name.replace(/\s+/g, '-')}`,
            type: 'hospital',
            label: name,
            data: { ...hospital },
            parentId: node.id,
            childCount: hospital.employeeIds.length,
            // Set initial position relative to parent
            x: (node.x || 0) + offsetX,
            y: (node.y || 0) + offsetY,
          });
          links.push({ source: node.id, target: `hospital-${name.replace(/\s+/g, '-')}` });
          index++;
        });
      }
      break;
    }

    case 'employee': {
      // In employees-first mode, show hospitals
      const employeeId = node.id.replace('employee-', '').split('-from-')[0];
      const hospitals = getHospitalsByEmployee(data, employeeId);
      let index = 0;
      hospitals.forEach(hospitalName => {
        const claims = getClaimsByEmployeeAndHospital(data, employeeId, hospitalName);
        const hospitalNodeId = `hospital-${hospitalName.replace(/\s+/g, '-')}-from-${employeeId}`;

        // Calculate position to push away from parent
        const angle = (index / hospitals.length) * 2 * Math.PI;
        const radius = 150;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        nodes.push({
          id: hospitalNodeId,
          type: 'hospital',
          label: hospitalName,
          data: { claims, claimCount: claims.length, employeeId },
          parentId: node.id,
          childCount: claims.length,
          x: (node.x || 0) + offsetX,
          y: (node.y || 0) + offsetY,
        });
        links.push({
          source: node.id,
          target: hospitalNodeId,
          label: `${claims.length} claims`,
          value: claims.length
        });
        index++;
      });
      break;
    }

    case 'hospital': {
      const hospitalName = node.label;

      // Check if this is a hospital expanded from an employee (employees-first mode)
      if (node.data.employeeId) {
        // Show claims for this specific employee at this hospital
        const employeeId = node.data.employeeId as string;
        const claims = node.data.claims as InsuranceClaim[];
        let index = 0;
        claims.forEach(claim => {
          const claimNodeId = `claim-${claim.claimId}-${employeeId}`;

          // Position claims in a circle around hospital
          const angle = (index / claims.length) * 2 * Math.PI;
          const radius = 120;
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius;

          nodes.push({
            id: claimNodeId,
            type: 'claim',
            label: claim.claimId,
            data: { ...claim, employeeId },
            parentId: node.id,
            x: (node.x || 0) + offsetX,
            y: (node.y || 0) + offsetY,
          });
          links.push({
            source: node.id,
            target: claimNodeId,
            value: claim.claimAmount
          });
          index++;
        });
      } else {
        // Hospitals-first mode: show employees
        const hospital = data.hospitals.get(hospitalName);
        if (hospital) {
          let index = 0;
          hospital.employeeIds.forEach(employeeId => {
            const emp = data.employees.get(employeeId);
            if (emp) {
              const claims = getClaimsByEmployeeAndHospital(data, employeeId, hospitalName);
              const employeeNodeId = `employee-${employeeId}-from-${hospitalName.replace(/\s+/g, '-')}`;

              // Position employees in a circle around hospital
              const angle = (index / hospital.employeeIds.length) * 2 * Math.PI;
              const radius = 150;
              const offsetX = Math.cos(angle) * radius;
              const offsetY = Math.sin(angle) * radius;

              nodes.push({
                id: employeeNodeId,
                type: 'employee',
                label: `${emp.personalDetails.firstName} ${emp.personalDetails.lastName}`,
                data: { ...emp, hospitalName, claims },
                parentId: node.id,
                childCount: claims.length,
                x: (node.x || 0) + offsetX,
                y: (node.y || 0) + offsetY,
              });
              links.push({
                source: node.id,
                target: employeeNodeId,
                label: `${claims.length} claims`,
                value: claims.length
              });
              index++;
            }
          });
        }
      }
      break;
    }
  }

  return { nodes, links };
}
