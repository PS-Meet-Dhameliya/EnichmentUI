import { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { GraphNode, GraphLink } from '@/types/graph';

interface ForceGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick: (node: GraphNode) => void;
  onNodeHover: (node: GraphNode | null) => void;
  selectedNodeId?: string;
  entityColors?: Record<string, string>;
}

const NODE_SIZES: Record<string, number> = {
  entity: 24,
  default: 14,
};

export function ForceGraph({
  nodes,
  links,
  onNodeClick,
  onNodeHover,
  selectedNodeId,
  entityColors = {}
}: ForceGraphProps) {
  const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isStabilized, setIsStabilized] = useState(false);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Configure forces
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge')?.strength(-400);
      fgRef.current.d3Force('link')?.distance(120);
      fgRef.current.d3Force('center')?.strength(0.05);
    }
  }, []);

  // Reset stabilization when nodes change and zoom to fit
  useEffect(() => {
    setIsStabilized(false);
    if (fgRef.current && nodes.length > 0) {
      // Reheat simulation for new nodes
      fgRef.current.d3ReheatSimulation();
      setTimeout(() => {
        fgRef.current?.zoomToFit(400, 80);
      }, 500);
    }
  }, [nodes.length]);

  // Handle simulation stabilization
  const handleEngineStop = useCallback(() => {
    setIsStabilized(true);
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    onNodeClick(node);

    // Center on clicked node smoothly
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 500);
    }
  }, [onNodeClick]);

  const drawNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const size = NODE_SIZES[node.type] || NODE_SIZES.default;
    const color = entityColors[node.type] || entityColors['entity'] || '#888';
    const isSelected = node.id === selectedNodeId;
    const x = node.x || 0;
    const y = node.y || 0;

    // Draw glow for entity nodes or selected nodes
    if (node.type === 'entity' || isSelected) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      gradient.addColorStop(0, color + '60');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw node circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = isSelected ? '#fff' : color;
    ctx.lineWidth = isSelected ? 3 : 1.5;
    ctx.stroke();

    // Draw inner highlight
    const innerGradient = ctx.createRadialGradient(
      x - size * 0.3, y - size * 0.3, 0,
      x, y, size
    );
    innerGradient.addColorStop(0, 'rgba(255,255,255,0.4)');
    innerGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();

    // Draw expand indicator if has children
    if (node.childCount && node.childCount > 0 && !node.expanded) {
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(8, 10 / globalScale)}px JetBrains Mono`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', x, y);
    }

    // Draw label
    const label = node.label;
    const fontSize = Math.max(10, 12 / globalScale);
    ctx.font = `500 ${fontSize}px Space Grotesk`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(label, x, y + size + 4);

    // Draw child count badge for entity nodes
    if (node.type === 'entity' && node.childCount) {
      const badgeY = y + size + 18;
      ctx.font = `400 ${fontSize * 0.8}px JetBrains Mono`;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`(${node.childCount})`, x, badgeY);
    }
  }, [selectedNodeId, entityColors]);

  const drawLink = useCallback((link: GraphLink, ctx: CanvasRenderingContext2D) => {
    const source = link.source as unknown as GraphNode;
    const target = link.target as unknown as GraphNode;

    const sourceX = source.x;
    const sourceY = source.y;
    const targetX = target.x;
    const targetY = target.y;

    // Skip if positions are not yet calculated
    if (sourceX === undefined || sourceY === undefined ||
      targetX === undefined || targetY === undefined) return;

    // Get colors
    const sourceColor = entityColors[source.type] || entityColors['entity'] || '#888';
    const targetColor = entityColors[target.type] || entityColors['entity'] || '#888';

    // Draw link with solid color for better visibility
    const lineWidth = link.value ? Math.min(4, 1.5 + link.value * 0.5) : 2;

    // Draw glow effect for links
    ctx.strokeStyle = sourceColor + '30';
    ctx.lineWidth = lineWidth + 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    // Draw main link line with gradient
    const gradient = ctx.createLinearGradient(sourceX, sourceY, targetX, targetY);
    gradient.addColorStop(0, sourceColor + 'CC');
    gradient.addColorStop(1, targetColor + 'CC');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
  }, [entityColors]);

  // Handle node drag - allow free movement
  const handleNodeDragEnd = useCallback((node: GraphNode) => {
    // Don't fix the node position - let it move freely
    // The improved physics will keep it stable without locking
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={{ nodes, links }}
        nodeCanvasObject={drawNode}
        linkCanvasObject={drawLink}
        linkDirectionalParticles={0}
        onNodeClick={handleNodeClick}
        onNodeHover={onNodeHover}
        onNodeDragEnd={handleNodeDragEnd}
        onEngineStop={handleEngineStop}
        nodePointerAreaPaint={(node, color, ctx) => {
          const size = NODE_SIZES[node.type] || 12;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x || 0, node.y || 0, size + 8, 0, 2 * Math.PI);
          ctx.fill();
        }}
        backgroundColor="transparent"
        cooldownTicks={50}
        warmupTicks={50}
        d3AlphaDecay={0.15}
        d3VelocityDecay={0.6}
        enableNodeDrag={true}
        enablePanInteraction={true}
        enableZoomInteraction={true}
        minZoom={0.3}
        maxZoom={4}
      />
    </div>
  );
}
