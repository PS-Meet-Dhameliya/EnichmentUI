import { useState, useMemo, useCallback, useEffect } from 'react';
import { ForceGraph } from './ForceGraph';
import { GraphNode, GraphLink } from '@/types/graph';
import { generateLargeDataset } from '@/utils/largeDataGen';

export function GraphClustering() {
    const [fullData, setFullData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
    const [visibleData, setVisibleData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Initialize data
    useEffect(() => {
        const data = generateLargeDataset(2000); // Generate 2000 nodes
        setFullData(data);

        // Initial view: Only Root and Department nodes (Level 1)
        const initialNodes = data.nodes.filter(n => n.parentId === undefined || n.parentId === 'entity-root');
        const initialLinks = data.links.filter(l =>
            initialNodes.find(n => n.id === (typeof l.source === 'object' ? (l.source as any).id : l.source)) &&
            initialNodes.find(n => n.id === (typeof l.target === 'object' ? (l.target as any).id : l.target))
        );

        setVisibleData({ nodes: initialNodes, links: initialLinks });
    }, []);

    const handleNodeClick = useCallback((node: GraphNode) => {
        if (!fullData) return;

        if (expandedIds.has(node.id)) {
            // Collapse logic (optional, but good for demo)
            // For now, let's just focus on Expand as per plan
            return;
        }

        // Find children in full dataset
        const children = fullData.nodes.filter(n => n.parentId === node.id);

        if (children.length === 0) return;

        // Add children to visible graph
        setVisibleData(prev => {
            const newNodes = [...prev.nodes, ...children];

            // Find links that connect to these new nodes
            // ONLY include links where both source and target are now visible
            const nodeIds = new Set(newNodes.map(n => n.id));
            const relevantLinks = fullData.links.filter(l => {
                const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
                const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
                return nodeIds.has(sourceId) && nodeIds.has(targetId);
            });

            return {
                nodes: newNodes,
                links: relevantLinks
            };
        });

        setExpandedIds(prev => new Set(prev).add(node.id));

    }, [fullData, expandedIds]);

    if (!fullData) return <div className="text-white">Generating Data...</div>;

    return (
        <div className="w-full h-full relative">
            <div className="absolute top-4 left-4 z-10 bg-slate-800/80 p-4 rounded-lg backdrop-blur text-white max-w-sm">
                <h2 className="text-xl font-bold mb-2">Strategy 1: Cluster & Expand</h2>
                <p className="text-sm text-slate-300 mb-2">
                    Total Nodes in Memory: {fullData.nodes.length}
                    <br />
                    Visible Nodes: {visibleData.nodes.length}
                </p>
                <p className="text-xs text-slate-400">
                    Click on a generic node (e.g. "Engineering") to expand its children.
                    This strategy keeps the initial render fast by only showing high-level aggregates.
                </p>
                <button
                    onClick={() => window.location.reload()} // Simple reset for demo
                    className="mt-2 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                >
                    Reset Demo
                </button>
            </div>

            <ForceGraph
                nodes={visibleData.nodes}
                links={visibleData.links}
                onNodeClick={handleNodeClick}
                onNodeHover={() => { }}
            />
        </div>
    );
}
