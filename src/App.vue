<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import SudokuBoard from './components/SudokuBoard.vue';
import { generateNewGame, isValidMove, solveSudoku, BLANK } from './utils/sudoku.js';

// State
const currentView = ref('menu'); // 'menu' | 'game'
const difficulty = ref('easy');
const board = ref([]);
const initialBoard = ref([]);
const solution = ref([]);
const selectedCell = ref(null);
const errorCells = ref([]);
const loading = ref(false);
const gameWon = ref(false);

// Actions
function startGame(diff) {
  difficulty.value = diff;
  currentView.value = 'game';
  loading.value = true;
  
  // Use timeout to allow UI transition
  setTimeout(() => {
    const game = generateNewGame(diff);
    board.value = game.current; 
    initialBoard.value = game.initial; 
    solution.value = game.solution;
    selectedCell.value = null;
    errorCells.value = [];
    gameWon.value = false;
    loading.value = false;
  }, 100);
}

function backToMenu() {
    if (confirm("Return to menu? Changes will be lost.")) {
        currentView.value = 'menu';
        board.value = []; // Clear to save memory?
    }
}

function handleCellSelect(coords) {
  selectedCell.value = coords;
}

function handleInput(num) {
  if (!selectedCell.value || gameWon.value) return;
  const { row, col } = selectedCell.value;
  if (initialBoard.value[row][col] !== BLANK) return;
  board.value[row][col] = num;
  checkWin();
}

function isBoardFull() {
  if (!board.value.length) return false;
  return board.value.every(row => row.every(cell => cell !== BLANK));
}

function checkWin() {
  if (isBoardFull()) {
     let correct = true;
     for(let r=0; r<9; r++) {
         for(let c=0; c<9; c++) {
             if (board.value[r][c] !== solution.value[r][c]) correct = false;
         }
     }
     if (correct) gameWon.value = true;
  }
}

function handleKeydown(e) {
  if (currentView.value !== 'game' || gameWon.value) return;
  if (e.key >= '1' && e.key <= '9') handleInput(parseInt(e.key));
  if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') handleInput(0);
  if (!selectedCell.value) return;
  const { row, col } = selectedCell.value;
  if (e.key === 'ArrowUp') selectedCell.value = { row: Math.max(0, row - 1), col };
  if (e.key === 'ArrowDown') selectedCell.value = { row: Math.min(8, row + 1), col };
  if (e.key === 'ArrowLeft') selectedCell.value = { row, col: Math.max(0, col - 1) };
  if (e.key === 'ArrowRight') selectedCell.value = { row, col: Math.min(8, col + 1) };
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// Tailwind Classes
const headerClass = "fixed top-8 w-full text-center pointer-events-none z-20 hidden lg:block";
const victoryBadgeClass = "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-6 bg-success text-white text-4xl font-extrabold py-2 px-8 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-bounce z-50";

</script>

<template>
  <main class="flex flex-col items-center justify-center min-h-screen w-full relative">
    
    <!-- Title -->
    <div class="mb-12 text-center z-10">
        <h1 class="text-6xl font-extrabold bg-gradient-to-r from-text-primary to-accent bg-clip-text text-transparent uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(6,182,212,0.5)] mb-2">Neon Sudoku</h1>
    </div>

    <!-- Start Menu -->
    <div v-if="currentView === 'menu'" class="flex flex-col gap-6 items-center animate-fade-in w-full max-w-sm px-4">
        <h2 class="text-text-secondary uppercase tracking-widest text-sm mb-4">Select Difficulty</h2>
        <button 
           v-for="diff in ['easy', 'medium', 'hard']"
           :key="diff"
           class="w-full py-4 bg-bg-secondary border border-white/10 rounded-xl text-xl font-bold uppercase hover:bg-bg-primary hover:border-accent hover:text-accent hover:scale-105 transition-all shadow-lg"
           @click="startGame(diff)"
         >
           {{ diff }}
         </button>
    </div>

    <!-- Game View -->
    <div v-else class="flex flex-col items-center gap-8 w-full animate-fade-in">
        
       <button @click="backToMenu" class="absolute top-4 left-4 lg:top-8 lg:left-8 px-4 py-2 text-text-secondary hover:text-white flex items-center gap-2 transition-colors">
            <span>← Back to Menu</span>
       </button>

       <div v-if="gameWon" :class="victoryBadgeClass">Victory!</div>

       <div class="flex justify-center items-center relative p-8 bg-bg-secondary/70 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
         <div v-if="loading" class="text-text-secondary italic animate-pulse">Generating Board...</div>
         <SudokuBoard 
           v-else
           :board="board"
           :initial-board="initialBoard"
           :selected-cell="selectedCell"
           :error-cells="errorCells"
           @cell-select="handleCellSelect"
         />
       </div>
    </div>

  </main>
</template>

<style>
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
}
</style>
