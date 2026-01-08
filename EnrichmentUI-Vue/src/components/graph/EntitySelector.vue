<script setup lang="ts">
import { useGraphStore } from '@/stores/graphStore'

const graphStore = useGraphStore()
</script>

<template>
  <div class="glass-panel p-4 rounded-lg w-[240px] animate-fade-in shadow-lg">
    <label class="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
      Entity Type
    </label>
    <select
      :value="graphStore.selectedEntityType"
      @change="(e) => graphStore.setEntityType((e.target as HTMLSelectElement).value)"
      class="w-full bg-gradient-to-b from-background/70 to-background/50 border border-border/70 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 hover:border-primary/40 cursor-pointer shadow-inner"
      style="color: hsl(210 40% 96%);"
    >
      <option
        v-for="entity in graphStore.availableEntities"
        :key="entity.id"
        :value="entity.id"
      >
        {{ entity.label }} ({{ entity.count }})
      </option>
    </select>
  </div>
</template>
