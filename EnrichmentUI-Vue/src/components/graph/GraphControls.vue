<script setup lang="ts">
import { RotateCcw, Download } from 'lucide-vue-next'

interface Props {
  nodeCount: number
  linkCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  reset: []
  export: [format: 'png' | 'svg']
}>()
</script>

<template>
  <div class="glass-panel p-4 rounded-lg animate-fade-in shadow-lg">
    <div class="flex items-center gap-4 flex-wrap">
      <!-- Stats -->
      <div class="flex gap-4 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-primary animate-pulse shadow-md shadow-primary/50"></div>
          <span class="text-muted-foreground font-semibold text-xs">Nodes:</span>
          <span class="ml-1 font-mono font-bold text-foreground">{{ nodeCount }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-md shadow-blue-400/50" style="animation-delay: 0.2s"></div>
          <span class="text-muted-foreground font-semibold text-xs">Links:</span>
          <span class="ml-1 font-mono font-bold text-foreground">{{ linkCount }}</span>
        </div>
      </div>

      <!-- Export Button -->
      <button
        @click="emit('export', 'png')"
        class="flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-primary/30 hover:border-primary/50 shadow-sm"
        title="Export as PNG (Ctrl+E)"
      >
        <Download :size="14" />
        <span class="text-xs font-semibold">Export</span>
      </button>

      <!-- Reset Button -->
      <button
        @click="emit('reset')"
        class="flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-primary/30 hover:border-primary/50 shadow-sm"
        title="Reset Graph (Ctrl+R)"
      >
        <RotateCcw :size="14" />
        <span class="text-xs font-semibold">Reset</span>
      </button>
    </div>
  </div>
</template>
