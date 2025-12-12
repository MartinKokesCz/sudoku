<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import SudokuBoard from './components/SudokuBoard.vue';
import ConfirmationModal from './components/ConfirmationModal.vue';
import NameInputModal from './components/NameInputModal.vue';
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
const showExitModal = ref(false);
const showNameModal = ref(false);
const timer = ref(0);
const bestTimes = ref({ easy: null, medium: null, hard: null }); // Now stores objects: { time: 120, name: 'Martin' } or just { time: 120 } for legacy
const currentPlayerName = ref('');
const pendingDifficulty = ref('');
let timerInterval = null;

// Initialize
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  const stored = localStorage.getItem('sudoku_best_times');
  if (stored) {
    bestTimes.value = JSON.parse(stored);
  }
});

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function startTimerAction() {
  stopTimerAction();
  timer.value = 0;
  timerInterval = setInterval(() => {
    timer.value++;
  }, 1000);
}

function stopTimerAction() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function saveBestTime() {
    const diff = difficulty.value;
    const current = timer.value;
    // Check if new record
    const currentRecord = bestTimes.value[diff];
    const bestTime = currentRecord ? currentRecord.time : Infinity;
    
    if (current < bestTime) {
        bestTimes.value[diff] = { time: current, name: currentPlayerName.value };
        localStorage.setItem('sudoku_best_times', JSON.stringify(bestTimes.value));
    }
}

// Actions
function initiateGameStart(diff) {
    pendingDifficulty.value = diff;
    showNameModal.value = true;
}

function handleNameConfirm(name) {
    currentPlayerName.value = name;
    showNameModal.value = false;
    startGame(pendingDifficulty.value);
}

function cancelNameInput() {
    showNameModal.value = false;
    pendingDifficulty.value = '';
}

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
    startTimerAction(); // START TIMER
  }, 100);
}

function backToMenu() {
    if (gameWon.value) {
        confirmExit();
    } else {
        showExitModal.value = true;
    }
}

function confirmExit() {
    currentView.value = 'menu';
    board.value = [];
    showExitModal.value = false;
    stopTimerAction();
}

function cancelExit() {
    showExitModal.value = false;
    // Resume timer if needed, but simple setInterval works for now even if running in bg
    // For strictness we could re-enable interval here if we paused it above.
    // Let's assume backToMenu doesn't fully STOP it, just 'pauses' conceptually? 
    // user likely wants it to keep ticking or pause. Let's keep it ticking for simplicity or restart if paused.
    // Actually, let's NOT stop it in backToMenu to imply the game is still live behind modal.
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
     if (correct) {
         gameWon.value = true;
         stopTimerAction();
         saveBestTime();
     }
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
const victoryBadgeClass = "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-6 bg-success/90 backdrop-blur text-white text-4xl font-extrabold py-4 px-12 rounded-xl shadow-glass animate-bounce z-50 border border-white/30";

</script>

<template>
  <!-- Main Container -->
  <main 
    class="flex flex-col items-center justify-center min-h-screen w-full relative p-4 font-sans"
  >
    
    <!-- Title -->
    <div class="mb-6 text-center z-10 flex flex-col items-center">
        <h1 class="text-6xl font-bold text-text-primary uppercase tracking-tight drop-shadow-lg mb-2" style="font-family: 'Outfit', sans-serif;">Cafe Sudoku</h1>
        
        <!-- Back Button (Centered under title when in game view) -->
        <button 
           v-if="currentView === 'game'" 
           @click="backToMenu" 
           class="px-6 py-2 glass-button rounded-full text-text-secondary hover:text-accent flex items-center gap-2 transition-colors font-medium mt-2 backdrop-blur-sm"
        >
            <span>← Menu</span>
       </button>
    </div>

    <!-- Start Menu -->
    <div v-if="currentView === 'menu'" class="flex flex-col md:flex-row gap-8 items-stretch md:items-start animate-fade-in w-full max-w-4xl px-4">
        
        <!-- Scoreboard (Left) -->
        <div class="glass-panel flex-1 p-8 rounded-2xl flex flex-col gap-4">
             <h3 class="text-accent uppercase tracking-widest text-sm font-semibold mb-2">Best Brews</h3>
             <div class="flex flex-col gap-3">
                 <div class="flex justify-between items-center px-4 py-3 rounded-lg bg-white/5 border border-white/5" v-for="diff in ['easy', 'medium', 'hard']" :key="'score-'+diff">
                     <span class="uppercase text-xs tracking-wider font-bold text-text-secondary w-16">{{ diff }}</span>
                     <div class="flex flex-col items-end">
                         <span class="font-mono text-lg text-white font-bold leading-none">
                            {{ bestTimes[diff] ? formatTime(bestTimes[diff].time || bestTimes[diff]) : '--:--' }}
                         </span>
                         <span v-if="bestTimes[diff] && bestTimes[diff].name" class="text-xs text-accent mt-1">
                             {{ bestTimes[diff].name }}
                         </span>
                     </div>
                 </div>
             </div>
        </div>

        <!-- Selection (Right) -->
        <div class="glass-panel flex-1 p-8 rounded-2xl flex flex-col gap-4">
            <h2 class="text-accent uppercase tracking-widest text-sm font-semibold mb-2">Select Blend</h2>
            <div class="flex flex-col gap-3">
                <button 
                   v-for="diff in ['easy', 'medium', 'hard']"
                   :key="diff"
                   class="w-full py-4 glass-button rounded-xl text-xl font-bold uppercase transition-all shadow-md group border-l-4 border-transparent hover:border-accent"
                   @click="initiateGameStart(diff)"
                 >
                   <span class="group-hover:translate-x-1 inline-block transition-transform">{{ diff }}</span>
                 </button>
            </div>
        </div>
    </div>

    <!-- Game View -->
    <div v-else class="flex flex-col items-center gap-6 w-full animate-fade-in">
        
       <!-- Timer Display -->
       <div class="glass-panel px-6 py-2 rounded-full font-mono text-2xl font-bold text-accent tracking-widest shadow-lg">
           {{ formatTime(timer) }}
       </div>

       <div v-if="gameWon" :class="victoryBadgeClass">
          <div>Victory!</div>
          <div class="text-lg font-normal mt-1 opacity-90">{{ formatTime(timer) }}</div>
       </div>

       <!-- Board Container - Glass Panel -->
       <div class="flex justify-center items-center relative p-8 glass-panel rounded-2xl">
         <div v-if="loading" class="text-accent italic animate-pulse">Brewing...</div>
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

    <ConfirmationModal 
      :is-open="showExitModal"
      title="Leave Game?"
      message="Your current progress will be lost. Are you sure you want to return to the menu?"
      confirm-text="Leave"
      cancel-text="Stay"
      @confirm="confirmExit"
      @cancel="cancelExit"
    />

    <NameInputModal
      :is-open="showNameModal"
      :difficulty="pendingDifficulty"
      @confirm="handleNameConfirm"
      @cancel="cancelNameInput"
    />

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
