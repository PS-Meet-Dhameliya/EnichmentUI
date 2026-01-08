<script setup lang="ts">
import { computed } from 'vue'
import type { EntityInfo } from '@/types/graph'

interface Props {
  entities: EntityInfo[]
  entityColors: Record<string, string>
  selectedFile: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  fileChange: [file: string]
}>()

// Available data files - only files that exist in public/data folder
const dataFiles = [
  { value: 'example-3-entities.json', label: '3 Entities (Employee, Policy, Claim)' },
  { value: 'example-4-entities.json', label: '4 Entities (Employee, Department, Project, Task)' },
  { value: 'car_details.json', label: 'Car Details (Suzuki Dataset)' }
]

// Ensure selected file is properly tracked
const selectedValue = computed({
  get: () => props.selectedFile,
  set: (value) => emit('fileChange', value)
})
</script>

<template>
  <div class="glass-panel p-4 rounded-lg w-[240px] space-y-4 animate-fade-in shadow-lg">
    <!-- Legend -->
    <div>
      <div class="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
        Entity Types
      </div>
      <div class="space-y-2.5">
        <div
          v-for="entity in entities"
          :key="entity.id"
          class="flex items-center gap-2.5 group cursor-default"
        >
          <div
            class="w-3.5 h-3.5 rounded-full shadow-lg transition-all duration-200 group-hover:scale-125 flex-shrink-0"
            :style="{ 
              backgroundColor: entityColors[entity.id] || entityColors['entity'],
              boxShadow: `0 0 8px ${entityColors[entity.id] || entityColors['entity']}50`
            }"
          />
          <span class="text-sm font-semibold text-foreground flex-1">{{ entity.label }}</span>
          <span class="text-xs text-muted-foreground font-mono">({{ entity.count }})</span>
        </div>
      </div>
    </div>

    <!-- Data Source Selector -->
    <div>
      <label class="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
        Data Source
      </label>
      <select
        v-model="selectedValue"
        class="w-full bg-gradient-to-b from-background/70 to-background/50 border border-border/70 rounded-lg px-3 py-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 hover:border-primary/40 cursor-pointer shadow-inner"
        style="color: hsl(210 40% 96%);"
      >
        <option
          v-for="file in dataFiles"
          :key="file.value"
          :value="file.value"
        >
          {{ file.label }}
        </option>
      </select>
    </div>
  </div>
</template>
