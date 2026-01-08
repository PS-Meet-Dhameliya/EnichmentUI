<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'
import type { GraphNode, GraphLink } from '@/types/graph'
import { QuadTree } from '@/utils/spatialIndex'
import { debounce } from '@/utils/debounce'

interface Props {
  nodes: GraphNode[]
  links: GraphLink[]
  selectedNodeId?: string
  entityColors?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  selectedNodeId: undefined,
  entityColors: () => ({})
})

const emit = defineEmits<{
  nodeClick: [node: GraphNode]
  nodeHover: [node: GraphNode | null]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const width = ref(800)
const height = ref(600)

let simulation: d3.Simulation<GraphNode, GraphLink> | null = null
let transform = d3.zoomIdentity
let quadTree: QuadTree<GraphNode> | null = null
let animationFrameId: number | null = null

// Performance optimizations
const isDirty = ref(true)
const lastRenderTime = ref(0)
const FPS_LIMIT = 60
const FRAME_TIME = 1000 / FPS_LIMIT

const NODE_SIZES: Record<string, number> = {
  entity: 24,
  default: 14,
}

// Update canvas size on mount and resize (debounced)
const updateDimensions = debounce(() => {
  if (containerRef.value && canvasRef.value) {
    const dpr = window.devicePixelRatio || 1
    width.value = containerRef.value.offsetWidth
    height.value = containerRef.value.offsetHeight
    
    if (canvasRef.value) {
      canvasRef.value.width = width.value * dpr
      canvasRef.value.height = height.value * dpr
      const context = canvasRef.value.getContext('2d')
      if (context) {
        context.scale(dpr, dpr)
      }
    }
    
    if (simulation) {
      const centerForce = simulation.force('center') as d3.ForceCenter<GraphNode>
      if (centerForce) {
        centerForce.x(width.value / 2).y(height.value / 2)
      }
    }
    
    isDirty.value = true
    rebuildQuadTree()
  }
}, 250)

// Rebuild spatial index for fast hit detection
function rebuildQuadTree() {
  if (!canvasRef.value || props.nodes.length === 0) {
    quadTree = null
    return
  }

  // Calculate bounds of all nodes
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  props.nodes.forEach(node => {
    if (node.x !== undefined && node.y !== undefined) {
      minX = Math.min(minX, node.x)
      maxX = Math.max(maxX, node.x)
      minY = Math.min(minY, node.y)
      maxY = Math.max(maxY, node.y)
    }
  })

  if (minX === Infinity) return

  // Add padding
  const padding = 100
  const bounds = {
    x: minX - padding,
    y: minY - padding,
    width: (maxX - minX) + padding * 2,
    height: (maxY - minY) + padding * 2
  }

  quadTree = new QuadTree<GraphNode>(bounds)
  props.nodes.forEach(node => {
    if (node.x !== undefined && node.y !== undefined) {
      quadTree!.insert(node)
    }
  })
}

// Find node at point using spatial index (O(log n) instead of O(n))
function findNodeAtPoint(x: number, y: number, radius = 20): GraphNode | null {
  if (!quadTree) {
    // Fallback to linear search if quadtree not available
    for (let i = props.nodes.length - 1; i >= 0; i--) {
      const node = props.nodes[i]
      if (node.x === undefined || node.y === undefined) continue

      const size = NODE_SIZES[node.type] || NODE_SIZES.default
      const dx = x - node.x
      const dy = y - node.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < size + 8) {
        return node
      }
    }
    return null
  }

  // Query small area around point
  const nearby = quadTree.query({
    x: x - radius,
    y: y - radius,
    width: radius * 2,
    height: radius * 2
  })

  // Check distance to each nearby node
  let closest: GraphNode | null = null
  let closestDistance = Infinity

  for (const node of nearby) {
    if (node.x === undefined || node.y === undefined) continue

    const size = NODE_SIZES[node.type] || NODE_SIZES.default
    const dx = x - node.x
    const dy = y - node.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < size + 8 && distance < closestDistance) {
      closest = node
      closestDistance = distance
    }
  }

  return closest
}

// Level-of-Detail rendering based on zoom scale
function drawNodeLOD(context: CanvasRenderingContext2D, node: GraphNode, scale: number) {
  if (node.x === undefined || node.y === undefined) return

  const size = NODE_SIZES[node.type] || NODE_SIZES.default
  const color = props.entityColors[node.type] || props.entityColors['entity'] || '#888'
  const isSelected = node.id === props.selectedNodeId

  // LOD 1: Very zoomed out (scale < 0.5) - Simple circles only
  if (scale < 0.5) {
    context.fillStyle = color
    context.beginPath()
    context.arc(node.x, node.y, Math.max(4, size * 0.5), 0, 2 * Math.PI)
    context.fill()
    return
  }

  // LOD 2: Medium zoom (0.5 <= scale < 1.2) - Circles with glow, no labels
  if (scale < 1.2) {
    // Draw glow
    const gradient = context.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 1.5)
    gradient.addColorStop(0, color + '50')
    gradient.addColorStop(1, 'transparent')
    context.fillStyle = gradient
    context.beginPath()
    context.arc(node.x, node.y, size * 1.5, 0, 2 * Math.PI)
    context.fill()

    // Draw node
    context.fillStyle = color
    context.beginPath()
    context.arc(node.x, node.y, size * 0.8, 0, 2 * Math.PI)
    context.fill()

    if (isSelected) {
      context.strokeStyle = '#fff'
      context.lineWidth = 2
      context.stroke()
    }
    return
  }

  // LOD 3: Zoomed in (scale >= 1.2) - Full detail with labels
  // Draw outer glow for entity nodes or selected nodes
  if (node.type === 'entity' || isSelected) {
    const gradient = context.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 2)
    gradient.addColorStop(0, color + '60')
    gradient.addColorStop(1, 'transparent')
    context.fillStyle = gradient
    context.beginPath()
    context.arc(node.x, node.y, size * 2, 0, 2 * Math.PI)
    context.fill()
  }

  // Draw node circle
  context.fillStyle = color
  context.beginPath()
  context.arc(node.x, node.y, size, 0, 2 * Math.PI)
  context.fill()

  // Draw border
  context.strokeStyle = isSelected ? '#fff' : color
  context.lineWidth = isSelected ? 3 : 1.5
  context.stroke()

  // Draw inner highlight
  const innerGradient = context.createRadialGradient(
    node.x - size * 0.3, node.y - size * 0.3, 0,
    node.x, node.y, size
  )
  innerGradient.addColorStop(0, 'rgba(255,255,255,0.4)')
  innerGradient.addColorStop(1, 'transparent')
  context.fillStyle = innerGradient
  context.beginPath()
  context.arc(node.x, node.y, size, 0, 2 * Math.PI)
  context.fill()

  // Draw expand indicator if has children
  if (node.childCount && node.childCount > 0 && !node.expanded) {
    context.fillStyle = '#fff'
    context.font = `${Math.max(8, 10 / scale)}px JetBrains Mono`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('+', node.x, node.y)
  }

  // Draw label (only when zoomed in enough)
  if (scale >= 1.0) {
    const fontSize = Math.max(10, 12 / scale)
    context.font = `500 ${fontSize}px Space Grotesk`
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillStyle = '#e2e8f0'
    context.fillText(node.label, node.x, node.y + size + 4)

    // Draw child count badge for entity nodes
    if (node.type === 'entity' && node.childCount) {
      const badgeY = node.y + size + 18
      context.font = `400 ${fontSize * 0.8}px JetBrains Mono`
      context.fillStyle = '#94a3b8'
      context.fillText(`(${node.childCount})`, node.x, badgeY)
    }
  }
}

// Draw links (optimized)
function drawLinks(context: CanvasRenderingContext2D, scale: number, linksToRender?: GraphLink[]) {
  // Skip link rendering when very zoomed out
  if (scale < 0.3) return

  // Use provided links or fall back to all links
  const links = linksToRender || props.links

  links.forEach(link => {
    const source = link.source as GraphNode
    const target = link.target as GraphNode

    if (!source.x || !source.y || !target.x || !target.y) return

    const sourceColor = props.entityColors[source.type] || props.entityColors['entity'] || '#888'
    const targetColor = props.entityColors[target.type] || props.entityColors['entity'] || '#888'

    // Simplified rendering when zoomed out
    if (scale < 0.8) {
      context.strokeStyle = sourceColor + '60'
      context.lineWidth = 1
      context.beginPath()
      context.moveTo(source.x, source.y)
      context.lineTo(target.x, target.y)
      context.stroke()
      return
    }

    // Full rendering when zoomed in
    // Draw glow effect
    context.strokeStyle = sourceColor + '30'
    context.lineWidth = (link.value ? Math.min(4, 1.5 + link.value * 0.5) : 2) + 4
    context.lineCap = 'round'
    context.beginPath()
    context.moveTo(source.x, source.y)
    context.lineTo(target.x, target.y)
    context.stroke()

    // Draw main link with gradient
    const gradient = context.createLinearGradient(source.x, source.y, target.x, target.y)
    gradient.addColorStop(0, sourceColor + 'CC')
    gradient.addColorStop(1, targetColor + 'CC')

    context.strokeStyle = gradient
    context.lineWidth = link.value ? Math.min(4, 1.5 + link.value * 0.5) : 2
    context.beginPath()
    context.moveTo(source.x, source.y)
    context.lineTo(target.x, target.y)
    context.stroke()
  })
}

// Get visible nodes for viewport culling (optimization for large datasets)
function getVisibleNodes(): GraphNode[] {
  if (props.nodes.length < 1000) {
    // For smaller datasets, render all nodes (culling overhead not worth it)
    return props.nodes
  }

  // Calculate viewport bounds with padding for smooth scrolling
  const padding = 200
  const viewport = {
    minX: transform.invertX(-padding),
    maxX: transform.invertX(width.value + padding),
    minY: transform.invertY(-padding),
    maxY: transform.invertY(height.value + padding)
  }

  // Filter nodes within viewport
  return props.nodes.filter(node => {
    if (node.x === undefined || node.y === undefined) return false
    return node.x >= viewport.minX && node.x <= viewport.maxX &&
           node.y >= viewport.minY && node.y <= viewport.maxY
  })
}

// Get visible links (only links between visible nodes)
function getVisibleLinks(visibleNodes: GraphNode[]): GraphLink[] {
  if (props.links.length < 2000) {
    // For smaller datasets, render all links
    return props.links
  }

  const visibleNodeIds = new Set(visibleNodes.map(n => n.id))
  
  return props.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id
    const targetId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId)
  })
}

// Optimized render function with dirty checking, FPS limiting, and viewport culling
function render(timestamp: number) {
  if (!canvasRef.value) return

  const context = canvasRef.value.getContext('2d')
  if (!context) return

  // FPS limiting
  if (timestamp - lastRenderTime.value < FRAME_TIME && !isDirty.value) {
    animationFrameId = requestAnimationFrame(render)
    return
  }

  // Only render if dirty or simulation is active
  if (!isDirty.value && (!simulation || simulation.alpha() < 0.01)) {
    animationFrameId = requestAnimationFrame(render)
    return
  }

  // Clear canvas
  context.save()
  context.clearRect(0, 0, width.value, height.value)

  // Apply zoom transform
  context.translate(transform.x, transform.y)
  context.scale(transform.k, transform.k)

  // Viewport culling for large datasets (5-10x performance improvement)
  const visibleNodes = getVisibleNodes()
  const visibleLinks = getVisibleLinks(visibleNodes)

  // Draw visible links only
  drawLinks(context, transform.k, visibleLinks)

  // Draw visible nodes with LOD
  visibleNodes.forEach(node => {
    drawNodeLOD(context, node, transform.k)
  })

  context.restore()

  isDirty.value = false
  lastRenderTime.value = timestamp
  animationFrameId = requestAnimationFrame(render)
}

// Initialize D3 force simulation
const initSimulation = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const context = canvas.getContext('2d')
  if (!context) return

  // Set up canvas for high DPI
  const dpr = window.devicePixelRatio || 1
  canvas.width = width.value * dpr
  canvas.height = height.value * dpr
  context.scale(dpr, dpr)

  // Create simulation with improved forces
  // Initially center all nodes at origin to prevent them from going off-screen
  props.nodes.forEach(node => {
    if (node.x === undefined || node.y === undefined) {
      node.x = 0
      node.y = 0
    }
  })

  simulation = d3.forceSimulation(props.nodes)
    .force('link', d3.forceLink<GraphNode, GraphLink>(props.links)
      .id(d => d.id)
      .distance(150) // Increased distance for better spacing
      .strength(0.8))
    .force('charge', d3.forceManyBody().strength(-500)) // Moderate repulsion
    .force('center', d3.forceCenter(0, 0).strength(0.3)) // Stronger centering initially
    .force('collision', d3.forceCollide().radius((d: GraphNode) => {
      const size = NODE_SIZES[d.type] || NODE_SIZES.default
      return size + 25 // Prevent overlapping with padding
    }).strength(0.9))
    .alphaDecay(0.022) // Slightly faster decay
    .velocityDecay(0.5) // More friction to keep nodes in bounds
    .on('tick', () => {
      isDirty.value = true
      // Rebuild quadtree periodically during simulation
      if (simulation && simulation.alpha() < 0.3) {
        rebuildQuadTree()
      }
    })

  // Setup zoom behavior
  const zoom = d3.zoom<HTMLCanvasElement, unknown>()
    .scaleExtent([0.3, 4])
    .on('zoom', (event) => {
      transform = event.transform
      isDirty.value = true
    })

  d3.select(canvas).call(zoom)

  // Setup drag behavior
  const drag = d3.drag<HTMLCanvasElement, unknown>()
    .subject((event) => {
      const [mx, my] = d3.pointer(event, canvas)
      const x = transform.invertX(mx)
      const y = transform.invertY(my)

      return findNodeAtPoint(x, y)
    })
    .on('start', function(event) {
      if (!event.active && simulation) simulation.alphaTarget(0.3).restart()
      if (event.subject) {
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      }
    })
    .on('drag', function(event) {
      if (event.subject) {
        event.subject.fx = transform.invertX(event.x)
        event.subject.fy = transform.invertY(event.y)
      }
    })
    .on('end', function(event) {
      if (!event.active && simulation) simulation.alphaTarget(0)
      if (event.subject) {
        event.subject.fx = null
        event.subject.fy = null
      }
    })

  d3.select(canvas).call(drag as any)

  // Handle click events (using spatial index)
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect()
    const x = transform.invertX(e.clientX - rect.left)
    const y = transform.invertY(e.clientY - rect.top)

    const node = findNodeAtPoint(x, y)
    if (node) {
      emit('nodeClick', node)

      // Center on clicked node
      const newTransform = d3.zoomIdentity
        .translate(width.value / 2, height.value / 2)
        .scale(transform.k)
        .translate(-node.x!, -node.y!)

      d3.select(canvas)
        .transition()
        .duration(500)
        .call(zoom.transform as any, newTransform)
    }
  })

  // Handle hover events (debounced, using spatial index)
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null
  canvas.addEventListener('mousemove', (e) => {
    if (hoverTimeout) clearTimeout(hoverTimeout)

    hoverTimeout = setTimeout(() => {
      const rect = canvas.getBoundingClientRect()
      const x = transform.invertX(e.clientX - rect.left)
      const y = transform.invertY(e.clientY - rect.top)

      const node = findNodeAtPoint(x, y)
      if (node) {
        canvas.style.cursor = 'pointer'
        emit('nodeHover', node)
      } else {
        canvas.style.cursor = 'default'
        emit('nodeHover', null)
      }
    }, 16) // ~60 FPS
  })

  // Zoom to fit after initial layout - improved centering with bounds checking
  const zoomToFit = () => {
    if (!simulation) return

    let checkCount = 0
    const maxChecks = 50 // Prevent infinite loops

    // Wait for simulation to stabilize
    const checkBounds = () => {
      checkCount++
      if (checkCount > maxChecks) {
        console.warn('Zoom to fit timeout')
        return
      }

      const bounds = {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity
      }

      let nodeCount = 0
      props.nodes.forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
          bounds.minX = Math.min(bounds.minX, node.x)
          bounds.maxX = Math.max(bounds.maxX, node.x)
          bounds.minY = Math.min(bounds.minY, node.y)
          bounds.maxY = Math.max(bounds.maxY, node.y)
          nodeCount++
        }
      })

      if (nodeCount === 0 || bounds.minX === Infinity) {
        setTimeout(checkBounds, 150)
        return
      }

      // Ensure we have valid bounds
      const graphWidth = Math.max(bounds.maxX - bounds.minX, 200)
      const graphHeight = Math.max(bounds.maxY - bounds.minY, 200)
      const centerX = (bounds.minX + bounds.maxX) / 2
      const centerY = (bounds.minY + bounds.maxY) / 2

      // Add generous padding to keep graph in view
      const padding = 150
      const availableWidth = width.value - padding * 2
      const availableHeight = height.value - padding * 2

      // Calculate optimal scale - ensure graph fits within viewport
      const scaleX = availableWidth / graphWidth
      const scaleY = availableHeight / graphHeight
      let scale = Math.min(scaleX, scaleY, 1.0) // Cap at 1.0x to ensure visibility

      // Ensure minimum scale for small graphs
      if (graphWidth < 300 && graphHeight < 300) {
        scale = Math.max(scale, 0.6)
      }

      // Center the graph in viewport
      const newTransform = d3.zoomIdentity
        .translate(width.value / 2, height.value / 2)
        .scale(scale)
        .translate(-centerX, -centerY)

      // Apply transform immediately, then animate
      transform = newTransform
      isDirty.value = true

      d3.select(canvas)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .call(zoom.transform as any, newTransform)

      // Reduce center force strength after initial positioning
      setTimeout(() => {
        if (simulation) {
          const centerForce = simulation.force('center') as d3.ForceCenter<GraphNode>
          if (centerForce) {
            centerForce.strength(0.05) // Reduce to allow natural movement
          }
        }
      }, 1500)

      // Initial quadtree build
      rebuildQuadTree()
    }

    // Start checking after simulation has run a bit
    setTimeout(checkBounds, 500)
  }

  zoomToFit()

  // Start render loop
  animationFrameId = requestAnimationFrame(render)
}

// Watch for node/link changes
watch(() => [props.nodes.length, props.links.length], () => {
  if (simulation) {
    // Ensure all nodes have initial positions
    props.nodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) {
        node.x = 0
        node.y = 0
      }
    })

    simulation.nodes(props.nodes)
    const linkForce = simulation.force('link') as d3.ForceLink<GraphNode, GraphLink>
    if (linkForce) {
      linkForce.links(props.links)
    }
    const collisionForce = simulation.force('collision') as d3.ForceCollide<GraphNode>
    if (collisionForce) {
      collisionForce.radius((d: GraphNode) => {
        const size = NODE_SIZES[d.type] || NODE_SIZES.default
        return size + 25
      })
    }
    
    // Temporarily increase center force when nodes change
    const centerForce = simulation.force('center') as d3.ForceCenter<GraphNode>
    if (centerForce) {
      centerForce.strength(0.3)
    }

    simulation.alpha(0.6).restart()
    isDirty.value = true
    
    // Reduce center force after layout stabilizes
    setTimeout(() => {
      if (simulation && centerForce) {
        centerForce.strength(0.05)
      }
      rebuildQuadTree()
    }, 1000)
  }
})

// Watch for selected node changes to trigger redraw
watch(() => props.selectedNodeId, () => {
  isDirty.value = true
})

onMounted(() => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
  initSimulation()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  if (simulation) {
    simulation.stop()
  }
})

// Expose canvas ref for export functionality
defineExpose({
  canvasRef
})
</script>

<template>
  <div ref="containerRef" class="w-full h-full absolute inset-0">
    <canvas
      ref="canvasRef"
      class="w-full h-full"
    />
  </div>
</template>
