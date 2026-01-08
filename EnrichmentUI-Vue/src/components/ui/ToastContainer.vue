<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-vue-next'

const { toasts, removeToast } = useToast()

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
}

const colorMap = {
  success: 'bg-green-500/20 border-green-500/50 text-green-400',
  error: 'bg-red-500/20 border-red-500/50 text-red-400',
  info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
}
</script>

<template>
  <div
    class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
    aria-live="polite"
    aria-atomic="true"
  >
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'glass-panel px-4 py-3 min-w-[300px] max-w-[500px] flex items-start gap-3 pointer-events-auto',
          colorMap[toast.type]
        ]"
        role="alert"
      >
        <component :is="iconMap[toast.type]" :size="20" class="mt-0.5 flex-shrink-0" />
        <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
        <button
          @click="removeToast(toast.id)"
          class="p-1 hover:opacity-70 transition-opacity flex-shrink-0"
          aria-label="Close notification"
        >
          <X :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>


