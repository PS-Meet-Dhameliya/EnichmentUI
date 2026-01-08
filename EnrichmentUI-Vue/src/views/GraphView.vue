<script setup lang="ts">
import { Suspense, onMounted } from 'vue'
import { useGraphStore } from '@/stores/graphStore'
import GraphVisualization from '@/components/graph/GraphVisualization.vue'

const graphStore = useGraphStore()

onMounted(async () => {
  // Load initial data - this will set currentDataFile in the store
  await graphStore.loadData('/data/example-3-entities.json')
})
</script>

<template>
  <div class="h-full w-full">
    <!-- Loading State -->
    <div v-if="graphStore.isLoading" class="h-full w-full bg-background flex flex-col items-center justify-center gap-4">
      <div class="text-primary text-lg">Loading graph...</div>
      <div class="w-64 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
        <div 
          class="h-full bg-primary transition-all duration-300"
          :style="{ width: `${graphStore.loadingProgress}%` }"
        />
      </div>
      <div class="text-sm text-muted-foreground">{{ graphStore.loadingProgress }}%</div>
    </div>

    <!-- Error State -->
    <div v-else-if="graphStore.error" class="h-full w-full bg-background flex items-center justify-center">
      <div class="text-destructive text-lg">{{ graphStore.error }}</div>
    </div>

    <!-- Main Graph -->
    <Suspense v-else>
      <template #default>
        <GraphVisualization />
      </template>
      <template #fallback>
        <div class="h-full w-full bg-background flex items-center justify-center">
          <div class="text-foreground text-lg">Loading graph...</div>
        </div>
      </template>
    </Suspense>
  </div>
</template>
