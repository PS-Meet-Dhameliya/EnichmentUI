import { useState, useMemo, useCallback, useEffect, FormEvent } from 'react';
import { ForceGraph } from './ForceGraph';
import { GraphNode, GraphLink } from '@/types/graph';
import { generateLargeDataset } from '@/utils/largeDataGen';

export function GraphSearch() {
    const [fullData, setFullData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
    const [visibleData, setVisibleData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
    const [searchQuery, setSearchQuery] = useState('');

    // Initialize data
    useEffect(() => {
        setFullData(generateLargeDataset(2000));
    }, []);

    const handleSearch = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!fullData || !searchQuery.trim()) return;

        const term = searchQuery.toLowerCase();

        // Find matching nodes
        const matches = fullData.nodes.filter(n =>
            n.label.toLowerCase().includes(term) ||
            n.id.toLowerCase().includes(term)
        );

        if (matches.length === 0) {
            alert('No nodes found');
            return;
        }

        // For each match, find immediate neighbors to give context
        const nodeIds = new Set<string>();
        matches.forEach(m => nodeIds.add(m.id));

        const relatedLinks = fullData.links.filter(l => {
            const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
            const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;

            if (nodeIds.has(sourceId)) {
                nodeIds.add(targetId);
                return true;
            }
            if (nodeIds.has(targetId)) {
                nodeIds.add(sourceId);
                return true;
            }
            return false;
        });

        // Reconstruct nodes from the IDs found (matches + neighbors)
        const newNodes = fullData.nodes.filter(n => nodeIds.has(n.id));

        setVisibleData({ nodes: newNodes, links: relatedLinks });
    }, [fullData, searchQuery]);

    const handleNodeClick = useCallback((node: GraphNode) => {
        // Context Expand: Add neighbors of clicked node
        if (!fullData) return;

        const neighborLinks = fullData.links.filter(l => {
            const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
            const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
            return sourceId === node.id || targetId === node.id;
        });

        setVisibleData(prev => {
            const newNodeIds = new Set(prev.nodes.map(n => n.id));
            const newLinkSet = new Set(prev.links); // This might be tricky with object references, but okay for demo

            const addedLinks: GraphLink[] = [];

            neighborLinks.forEach(l => {
                // Check if we already have this link
                // For simplicity, just add all neighbors
                const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
                const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;

                if (!newNodeIds.has(sourceId)) newNodeIds.add(sourceId);
                if (!newNodeIds.has(targetId)) newNodeIds.add(targetId);

                addedLinks.push(l);
            });

            const newNodes = fullData.nodes.filter(n => newNodeIds.has(n.id));

            // Merge links (naively for demo)
            const allLinks = [...prev.links, ...addedLinks];
            // Deduplicate links based on source-target
            const uniqueLinks = allLinks.filter((link, index, self) =>
                index === self.findIndex((t) => (
                    (t.source === link.source || (t.source as any).id === (link.source as any).id) &&
                    (t.target === link.target || (t.target as any).id === (link.target as any).id)
                ))
            );

            return { nodes: newNodes, links: uniqueLinks };
        });
    }, [fullData]);

    if (!fullData) return <div className="text-white">Generating Data...</div>;

    return (
        <div className="w-full h-full relative">
            <div className="absolute top-4 left-4 z-10 bg-slate-800/80 p-4 rounded-lg backdrop-blur text-white max-w-sm">
                <h2 className="text-xl font-bold mb-2">Strategy 3: Search & Context</h2>

                <form onSubmit={handleSearch} className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm w-full outline-none focus:border-cyan-400"
                    />
                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1 rounded text-sm">
                        Go
                    </button>
                </form>

                <p className="text-xs text-slate-400">
                    Start empty. Search for "Employee" or "Engineering" to find nodes.
                    Click a node to reveal its connections.
                    Best for finding specific needles in a haystack.
                </p>
            </div>

            {visibleData.nodes.length === 0 ? (
                <div className="flex items-center justify-center w-full h-full text-slate-500">
                    Use search to find nodes
                </div>
            ) : (
                <ForceGraph
                    nodes={visibleData.nodes}
                    links={visibleData.links}
                    onNodeClick={handleNodeClick}
                    onNodeHover={() => { }}
                />
            )}
        </div>
    );
}
