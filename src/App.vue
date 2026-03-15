<script setup lang="ts">
import { Show } from '@clerk/vue'
import LoginView from '@/modules/auth/LoginView.vue'
</script>

<template>
  <Show when="signed-in">
    <RouterView />
  </Show>
  <Show when="signed-out">
    <LoginView />
  </Show>
</template>
