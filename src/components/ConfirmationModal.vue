<script setup>
defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'Yes' },
  cancelText: { type: String, default: 'Cancel' }
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <Teleport to="body">
    <Transition 
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('cancel')"></div>

        <!-- Modal Panel -->
        <div class="glass-panel w-full max-w-sm rounded-2xl p-6 relative z-10 flex flex-col gap-4 text-center shadow-2xl border-white/20">
          <h3 class="text-2xl font-bold text-text-primary font-sans">{{ title }}</h3>
          <p class="text-text-secondary">{{ message }}</p>
          
          <div class="flex gap-4 justify-center mt-2">
            <button 
              @click="emit('cancel')" 
              class="px-5 py-2 rounded-xl text-text-secondary hover:bg-white/5 hover:text-white transition-colors border border-transparent hover:border-white/10"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="emit('confirm')" 
              class="px-6 py-2 rounded-xl bg-accent text-bg-primary font-bold hover:bg-white hover:text-accent transition-all shadow-lg"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
