import { useState, useCallback } from 'react';
import { ForceGraph } from './ForceGraph';
import { NodeDetailPanel } from './NodeDetailPanel';
import { GraphControls } from './GraphControls';
import { GraphLegend } from './GraphLegend';
import { EntitySelector } from './EntitySelector';
import { useGraphData } from '@/hooks/useGraphData';
import { GraphNode } from '@/types/graph';

export function GraphVisualization() {
  const {
    nodes,
    links,
    selectedNode,
    navigationMode,
    selectedEntityType,
    availableEntities,
    toggleNode,
    selectNode,
    resetGraph,
    setSelectedEntityType
  } = useGraphData();

  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const handleNodeClick = useCallback((node: GraphNode) => {
    toggleNode(node.id);
    selectNode(node);
  }, [toggleNode, selectNode]);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node);
  }, []);

  const handleClosePanel = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="graph-container h-screen w-screen relative overflow-hidden">
      {/* Force Graph Canvas */}
      <div className="absolute inset-0">
        <ForceGraph
          nodes={nodes}
          links={links}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          selectedNodeId={selectedNode?.id}
        />
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Title */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 pointer-events-auto z-20">
          <h1 className="text-base font-semibold text-foreground tracking-tight">
            Entity Relationship Explorer
          </h1>
          <p className="text-[10px] text-muted-foreground text-center mt-0.5">
            Interactive force-directed graph visualization
          </p>
        </div>

        {/* Entity Selector */}
        <div className="pointer-events-auto z-20">
          <EntitySelector
            entities={availableEntities}
            selectedEntity={selectedEntityType}
            onEntityChange={setSelectedEntityType}
          />
        </div>

        {/* Legend */}
        <div className="pointer-events-auto z-10">
          <GraphLegend navigationMode={navigationMode} />
        </div>

        {/* Controls */}
        <div className="pointer-events-auto z-10">
          <GraphControls
            onReset={resetGraph}
            nodeCount={nodes.length}
            linkCount={links.length}
          />
        </div>

        {/* Detail Panel */}
        <div className="pointer-events-auto z-20">
          <NodeDetailPanel
            node={selectedNode || hoveredNode}
            onClose={handleClosePanel}
          />
        </div>
      </div>
    </div>
  );
}
