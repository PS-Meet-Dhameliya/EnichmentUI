import { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { GraphNode, GraphLink } from '@/types/graph';
import { generateLargeDataset } from '@/utils/largeDataGen';

export function GraphHighPerf() {
    const [data, setData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
    const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>(null);

    useEffect(() => {
        // Generate massive dataset
        setData(generateLargeDataset(2500));
    }, []);

    const drawNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const x = node.x || 0;
        const y = node.y || 0;

        // Level of Detail (LOD) Logic
        if (globalScale < 0.6) {
            // LOW DETAIL: Just a pixel/dot
            ctx.fillStyle = getNodeColor(node.type);
            ctx.fillRect(x - 1, y - 1, 2, 2);
            return;
        }

        if (globalScale < 1.5) {
            // MEDIUM DETAIL: Circle, no text
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = getNodeColor(node.type);
            ctx.fill();
            return;
        }

        // HIGH DETAIL: Full render with label
        const size = 6;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fillStyle = getNodeColor(node.type);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        const label = node.label;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#ccc';
        ctx.fillText(label, x, y + size + 2);
    }, []);

    if (!data) return <div className="text-white">Generating 2500+ nodes...</div>;

    return (
        <div className="w-full h-full relative">
            <div className="absolute top-4 left-4 z-10 bg-slate-800/80 p-4 rounded-lg backdrop-blur text-white max-w-sm">
                <h2 className="text-xl font-bold mb-2">Strategy 2: One-Shot & LOD</h2>
                <p className="text-sm text-slate-300 mb-2">
                    Nodes: {data.nodes.length} | Links: {data.links.length}
                </p>
                <p className="text-xs text-slate-400">
                    All nodes loaded at once. Zoom out to see density (dots). Zoom in to reveal labels.
                    Physics is tweaked for stability.
                </p>
            </div>

            <ForceGraph2D
                ref={fgRef}
                graphData={data}
                nodeCanvasObject={drawNode}
                // Optimize Link Drawing
                linkWidth={globalScale => globalScale < 1 ? 0.5 : 1}
                linkColor={() => '#ffffff20'} // Transparent links for performance
                // Physics Optimizations for large groups
                cooldownTicks={100} // Stop simulation after 100 ticks
                warmupTicks={50}   // Pre-calculate 50 ticks before render
                d3AlphaDecay={0.2} // Higher friction to settle faster
                d3VelocityDecay={0.8}
                // Interaction
                enableNodeDrag={false} // Dragging 2000 nodes is expensive
                minZoom={0.1}
                maxZoom={10}
                backgroundColor="transparent"
            />
        </div>
    );
}

function getNodeColor(type: string) {
    switch (type) {
        case 'entity': return '#22d3ee';
        case 'hospital': return '#34d399';
        case 'employee': return '#38bdf8';
        case 'claim': return '#fbbf24';
        default: return '#999';
    }
}
