<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGraphStore } from '@/stores/graphStore'
import ForceGraph from './ForceGraph.vue'
import NodeDetailPanel from './NodeDetailPanel.vue'
import EntitySelector from './EntitySelector.vue'
import GraphLegend from './GraphLegend.vue'
import GraphControls from './GraphControls.vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useGraphExport } from '@/composables/useGraphExport'
import type { GraphNode } from '@/types/graph'

const graphStore = useGraphStore()
const hoveredNode = ref<GraphNode | null>(null)
const canvasRef = ref<InstanceType<typeof ForceGraph> | null>(null)

// Use the file from store to ensure reactivity
const dataFile = computed(() => graphStore.currentDataFile)

const { exportAsPNG } = useGraphExport()

const handleNodeClick = (node: GraphNode) => {
  graphStore.toggleNode(node.id)
  graphStore.selectNode(node)
}

const handleNodeHover = (node: GraphNode | null) => {
  hoveredNode.value = node
  // Don't show detail panel on hover, only on click
}

const handleClosePanel = () => {
  graphStore.selectNode(null)
  hoveredNode.value = null
}

const handleFileChange = async (file: string) => {
  await graphStore.loadData(`/data/${file}`)
}

const handleExport = (format: 'png' | 'svg') => {
  if (format === 'png' && canvasRef.value?.canvasRef) {
    exportAsPNG(canvasRef.value.canvasRef)
  }
}

const handleReset = () => {
  graphStore.resetGraph()
}

// Keyboard shortcuts
useKeyboardShortcuts([
  {
    key: 'r',
    ctrl: true,
    handler: handleReset,
    description: 'Reset graph'
  },
  {
    key: 'e',
    ctrl: true,
    handler: () => handleExport('png'),
    description: 'Export graph'
  },
  {
    key: 'Escape',
    handler: handleClosePanel,
    description: 'Close detail panel'
  }
])

// Only show detail panel for selected node, not hovered
const displayNode = computed(() => graphStore.selectedNode)
</script>

<template>
  <div class="graph-container h-screen w-screen relative overflow-hidden">
    <!-- Force Graph Canvas - Full screen -->
    <div class="absolute inset-0">
      <ForceGraph
        ref="canvasRef"
        :nodes="graphStore.nodes"
        :links="graphStore.links"
        :selected-node-id="graphStore.selectedNode?.id"
        :entity-colors="graphStore.entityColors"
        @node-click="handleNodeClick"
        @node-hover="handleNodeHover"
      />
    </div>

    <!-- Overlay UI -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Title - Top Center -->
      <div class="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 pointer-events-auto z-20 animate-fade-in shadow-lg">
        <h1 class="text-lg font-bold text-foreground tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          Entity Relationship Explorer
        </h1>
        <p class="text-xs text-muted-foreground text-center mt-1 font-medium">
          Interactive force-directed graph visualization
        </p>
      </div>

      <!-- Left Sidebar - Stacked vertically -->
      <div class="absolute top-20 left-4 pointer-events-auto z-20 flex flex-col gap-4">
        <!-- Entity Selector -->
        <EntitySelector />
        
        <!-- Legend with Data Source Selector -->
        <GraphLegend
          :entities="graphStore.availableEntities"
          :entity-colors="graphStore.entityColors"
          :selected-file="dataFile"
          @file-change="handleFileChange"
        />
      </div>

      <!-- Controls - Bottom Right (adjusts position when detail panel is open) -->
      <div 
        class="absolute bottom-4 pointer-events-auto z-10 transition-all duration-300"
        :style="{ right: displayNode ? '340px' : '16px' }"
      >
        <GraphControls
          :node-count="graphStore.nodeCount"
          :link-count="graphStore.linkCount"
          @reset="handleReset"
          @export="handleExport"
        />
      </div>

      <!-- Detail Panel - Right Side -->
      <div class="pointer-events-auto z-30">
        <NodeDetailPanel
          :node="displayNode"
          @close="handleClosePanel"
        />
      </div>
    </div>
  </div>
</template>
