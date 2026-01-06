import { useState, useCallback } from 'react';
import { ForceGraph } from './ForceGraph';
import { NodeDetailPanel } from './NodeDetailPanel';
import { GraphControls } from './GraphControls';
import { GraphLegend } from './GraphLegend';
import { EntitySelector } from './EntitySelector';
import { useGraphData } from '@/hooks/useGraphData';
import { GraphNode } from '@/types/graph';
import { GraphClustering } from './GraphClustering';
import { GraphHighPerf } from './GraphHighPerf';
import { GraphSearch } from './GraphSearch';

type DemoMode = 'original' | 'clustering' | 'high-perf' | 'search';

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



  const [demoMode, setDemoMode] = useState<DemoMode>('original');
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
    <div className="graph-container h-screen w-screen relative overflow-hidden bg-[#0f172a]">

      {/* Demo Switcher */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2 p-1 bg-slate-800/80 backdrop-blur rounded-full border border-slate-700">
        <button
          onClick={() => setDemoMode('original')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${demoMode === 'original' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
        >
          Original
        </button>
        <button
          onClick={() => setDemoMode('clustering')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${demoMode === 'clustering' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
        >
          Strategy 1: Cluster
        </button>
        <button
          onClick={() => setDemoMode('high-perf')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${demoMode === 'high-perf' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
        >
          Strategy 2: LOD
        </button>
        <button
          onClick={() => setDemoMode('search')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${demoMode === 'search' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
        >
          Strategy 3: Search
        </button>
      </div>

      {demoMode === 'original' && (
        <>
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
            <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 pointer-events-auto z-20">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                Entity Relationship Explorer
              </h1>
              <p className="text-xs text-muted-foreground text-center mt-1">
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
        </>
      )}

      {demoMode === 'clustering' && <GraphClustering />}
      {demoMode === 'high-perf' && <GraphHighPerf />}
      {demoMode === 'search' && <GraphSearch />}
    </div>
  );
}
