<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import type { GraphNode } from '@/types/graph'
import { formatPropertyValue, groupProperties } from '@/utils/formatProperty'

interface Props {
  node: GraphNode | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// Format and group properties
const propertyGroups = computed(() => {
  if (!props.node || !props.node.data) return {}
  
  // Filter out internal fields that are already displayed
  const filteredData = { ...props.node.data }
  delete filteredData.count
  
  return groupProperties(filteredData)
})

// Get basic info
const basicInfo = computed(() => {
  if (!props.node) return {}
  
  const info: Record<string, unknown> = {}
  if (props.node.data.id) info.id = props.node.data.id
  if (props.node.data.type) info.type = props.node.data.type
  if (props.node.data.name) info.name = props.node.data.name
  
  return info
})
</script>

<template>
  <Transition name="slide-right">
    <div
      v-if="node"
      class="fixed right-4 top-4 w-80 max-h-[calc(100vh-2rem)] glass-panel shadow-2xl z-30 overflow-y-auto rounded-lg"
    >
      <!-- Header -->
      <div class="sticky top-0 bg-gradient-to-b from-card/98 to-card/95 backdrop-blur-xl p-5 border-b border-border/50 z-10">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
              {{ node.type.toUpperCase() }}
            </div>
            <h2 class="text-xl font-bold text-foreground leading-tight break-words">{{ node.label }}</h2>
          </div>
          <button
            @click="emit('close')"
            class="p-1.5 hover:bg-accent/10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
            aria-label="Close panel"
          >
            <X :size="18" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-5 space-y-4">
        <!-- Relationship Count -->
        <div class="glass-panel p-4 rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
          <div class="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            Relationships
          </div>
          <div class="text-3xl font-bold text-primary">{{ node.childCount || 0 }}</div>
        </div>

        <!-- Basic Information -->
        <div v-if="Object.keys(basicInfo).length > 0" class="space-y-2.5">
          <div class="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider px-1">
            Basic Information
          </div>
          <div
            v-for="(value, key) in basicInfo"
            :key="key"
            class="glass-panel p-3 rounded-lg border border-border/40"
          >
            <div class="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
              {{ key }}
            </div>
            <div class="text-sm font-semibold text-foreground break-words">
              {{ value }}
            </div>
          </div>
        </div>

        <!-- Property Groups -->
        <div
          v-for="(group, groupName) in propertyGroups"
          :key="groupName"
          class="space-y-2.5"
        >
          <div class="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider px-1">
            {{ groupName }}
          </div>
          <div
            v-for="(value, key) in group"
            :key="key"
            class="glass-panel p-3 rounded-lg border border-border/40 hover:border-border/60 transition-all duration-200"
          >
            <div class="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
              {{ key }}
            </div>
            <div 
              v-if="formatPropertyValue(key, value).type === 'json'"
              class="text-xs font-mono text-foreground break-words leading-relaxed whitespace-pre-wrap bg-background/40 p-2 rounded border border-border/20"
            >
              {{ formatPropertyValue(key, value).displayValue }}
            </div>
            <div 
              v-else-if="formatPropertyValue(key, value).type === 'email'"
              class="text-sm font-semibold text-primary break-words"
            >
              {{ formatPropertyValue(key, value).displayValue }}
            </div>
            <div 
              v-else
              class="text-sm font-semibold text-foreground break-words"
            >
              {{ formatPropertyValue(key, value).displayValue }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
