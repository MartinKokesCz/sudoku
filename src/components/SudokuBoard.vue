<script setup>
import SudokuCell from './SudokuCell.vue';

const props = defineProps({
  board: { type: Array, required: true },
  initialBoard: { type: Array, required: true },
  selectedCell: { type: Object, default: null },
  errorCells: { type: Array, default: () => [] }
});

const emit = defineEmits(['cell-select']);

function isSelected(r, c) {
  return props.selectedCell && props.selectedCell.row === r && props.selectedCell.col === c;
}

function isInitial(r, c) {
  return props.initialBoard[r][c] !== 0;
}

function isError(r, c) {
    return props.errorCells.some(e => e.row === r && e.col === c);
}
</script>

<template>
  <!-- Use CSS Grid for robust 9x9 layout -->
  <!-- We use inline style for grid-template-rows to ensure 9 equal rows, as grid-rows-9 is not always standard utility -->
  <div 
    class="grid grid-cols-9 border-4 border-text-secondary bg-bg-primary rounded w-full max-w-[500px]"
    style="aspect-ratio: 1 / 1; grid-template-rows: repeat(9, minmax(0, 1fr));"
  >
    <template v-for="(row, rIndex) in board" :key="rIndex">
      <SudokuCell
        v-for="(cellValue, cIndex) in row"
        :key="`${rIndex}-${cIndex}`"
        :value="cellValue"
        :row-index="rIndex"
        :col-index="cIndex"
        :initial="isInitial(rIndex, cIndex)"
        :active="isSelected(rIndex, cIndex)"
        :error="isError(rIndex, cIndex)"
        @select="(coords) => emit('cell-select', coords)"
      />
    </template>
  </div>
</template>
