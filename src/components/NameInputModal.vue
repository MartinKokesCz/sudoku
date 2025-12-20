<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  difficulty: string;
}>();

const emit = defineEmits<{
  (e: 'confirm', name: string): void;
  (e: 'cancel'): void;
}>();

const playerName = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        playerName.value = '';
        setTimeout(() => inputRef.value?.focus(), 100);
    }
});

function handleConfirm() {
    if (playerName.value.trim()) {
        emit('confirm', playerName.value.trim());
    }
}
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
        <div class="glass-panel w-full max-w-sm rounded-2xl p-8 relative z-10 flex flex-col gap-6 text-center shadow-2xl border-white/20">
          <div>
              <h3 class="text-2xl font-bold text-text-primary font-sans mb-1">New Order</h3>
              <p class="text-text-secondary text-sm">Who is this {{ difficulty }} brew for?</p>
          </div>
          
          <input 
            ref="inputRef"
            v-model="playerName"
            @keyup.enter="handleConfirm"
            type="text" 
            placeholder="Enter your name" 
            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />

          <div class="flex gap-4 justify-center">
            <button 
              @click="emit('cancel')" 
              class="px-5 py-2 rounded-xl text-text-secondary hover:bg-white/5 hover:text-white transition-colors border border-transparent hover:border-white/10"
            >
              Cancel
            </button>
            <button 
              @click="handleConfirm" 
              :disabled="!playerName.trim()"
              class="px-8 py-2 rounded-xl bg-accent text-bg-primary font-bold hover:bg-white hover:text-accent transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Brewing
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
