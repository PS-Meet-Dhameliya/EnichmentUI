<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const message = ref('Page Not Found')
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-primary mb-4">404</h1>
      <p class="text-xl text-foreground mb-8">{{ message }}</p>
      <RouterLink
        to="/"
        class="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-smooth"
      >
        Go Home
      </RouterLink>
    </div>
  </div>
</template>
