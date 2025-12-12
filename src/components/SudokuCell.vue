<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: { type: Number, default: 0 },
  initial: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  highlight: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  rowIndex: Number,
  colIndex: Number
});

const emit = defineEmits(['select']);

function handleClick() {
  emit('select', { row: props.rowIndex, col: props.colIndex });
}

// Compute classes dynamically
const listClasses = computed(() => {
    let classes = [
        'w-full', 'h-full', 'flex', 'justify-center', 'items-center', 'p-2', // Increased padding to p-2
        'text-2xl', 'font-semibold', 'cursor-pointer', 'border', 
        'border-white/20', 'transition-all', 'duration-100', 'select-none',
        'hover:bg-white/5'
    ];
    
    // Borders for 3x3 grids (simulating nth-child logic with props)
    if ((props.colIndex + 1) % 3 === 0 && props.colIndex !== 8) classes.push('border-r-2 border-r-slate-400/50');
    if ((props.rowIndex + 1) % 3 === 0 && props.rowIndex !== 8) classes.push('border-b-2 border-b-slate-400/50');
    
    // States
    if (props.active) classes.push('bg-accent/10 shadow-[inset_0_0_10px_rgba(6,182,212,0.5)]');
    else if (props.highlight) classes.push('bg-white/5');
    
    if (props.error) classes.push('bg-red-500/20 text-error');
    
    if (props.initial) classes.push('text-text-secondary font-bold');
    else classes.push('text-accent');
    
    return classes.join(' ');
});

</script>

<template>
  <div 
    :class="listClasses"
    @click="handleClick"
  >
    <span v-if="value !== 0">{{ value }}</span>
  </div>
</template>
