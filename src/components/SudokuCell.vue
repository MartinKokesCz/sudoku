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
        'w-full', 'h-full', 'flex', 'justify-center', 'items-center', 'p-2', 
        'text-2xl', 'font-semibold', 'cursor-pointer', 'border', 
        'border-white/5', 'transition-all', 'duration-200', 'select-none',
        'hover:bg-white/10'
    ];
    
    // Borders for 3x3 grids (simulating nth-child logic with props)
    if ((props.colIndex + 1) % 3 === 0 && props.colIndex !== 8) classes.push('border-r-2 border-r-white/20');
    if ((props.rowIndex + 1) % 3 === 0 && props.rowIndex !== 8) classes.push('border-b-2 border-b-white/20');
    
    // States
    if (props.active) classes.push('bg-accent/30 text-white shadow-inner'); // Warm caramel selection
    else if (props.highlight) classes.push('bg-white/5');
    
    if (props.error) classes.push('bg-error/30 text-text-primary'); // Burnt orange error
    
    // Text colors
    if (props.initial) classes.push('text-text-primary font-bold'); // Milk foam
    else classes.push('text-accent font-medium'); // Latte art color for input
    
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
