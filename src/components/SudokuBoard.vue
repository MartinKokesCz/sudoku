<script setup lang="ts">
import SudokuCell from './SudokuCell.vue';
import type { SudokuBoard } from '../utils/sudoku';

const props = defineProps({
  board: { type: Array as () => SudokuBoard, required: true },
  initialBoard: { type: Array as () => SudokuBoard, required: true },
  selectedCell: { type: Object as () => { row: number, col: number } | null, default: null },
  errorCells: { type: Array as () => { row: number, col: number }[], default: () => [] }
});

const emit = defineEmits<{
  (e: 'cell-select', coords: { row: number, col: number }): void
}>();

function isSelected(r: number, c: number) {
  return !!(props.selectedCell && props.selectedCell.row === r && props.selectedCell.col === c);
}

function isInitial(r: number, c: number) {
  const row = props.initialBoard[r];
  return row && row[c] !== 0;
}

function isError(r: number, c: number) {
    return props.errorCells.some(e => e.row === r && e.col === c);
}
</script>

<template>
  <!-- Use CSS Grid for robust 9x9 layout -->
  <!-- We use inline style for grid-template-rows to ensure 9 equal rows, as grid-rows-9 is not always standard utility -->
  <div 
    class="grid grid-cols-9 rounded-lg overflow-hidden border border-white/10 shadow-inner"
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
        @select="(coords: { row: number, col: number }) => emit('cell-select', coords)"
      />
    </template>
  </div>
</template>
