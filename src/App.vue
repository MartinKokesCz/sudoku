<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import SudokuBoard from './components/SudokuBoard.vue';
import ConfirmationModal from './components/ConfirmationModal.vue';
import NameInputModal from './components/NameInputModal.vue';
import { generateNewGame, BLANK } from './utils/sudoku';
import type { SudokuBoard as SudokuBoardType } from './utils/sudoku';

// Types
type Difficulty = 'easy' | 'medium' | 'hard';
interface BestTime {
    time: number;
    name?: string;
}
interface BestTimes {
    easy: BestTime | null;
    medium: BestTime | null;
    hard: BestTime | null;
    [key: string]: BestTime | null;
}

// State
const currentView = ref<'menu' | 'game'>('menu');
const difficulty = ref<Difficulty>('easy');
const board = ref<SudokuBoardType>([]);
const initialBoard = ref<SudokuBoardType>([]);
const solution = ref<SudokuBoardType>([]);
const selectedCell = ref<{ row: number, col: number } | null>(null);
const errorCells = ref<{ row: number, col: number }[]>([]);
const loading = ref(false);
const gameWon = ref(false);
const showExitModal = ref(false);
const showNameModal = ref(false);
const timer = ref(0);
const bestTimes = ref<BestTimes>({ easy: null, medium: null, hard: null });
const currentPlayerName = ref('');
const pendingDifficulty = ref<Difficulty | ''>('');
let timerInterval: ReturnType<typeof setInterval> | null = null;

// Initialize
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  const stored = localStorage.getItem('sudoku_best_times');
  if (stored) {
    bestTimes.value = JSON.parse(stored);
  }
});

function formatTime(seconds: number) {
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
    const bestTimeValue = currentRecord ? currentRecord.time : Infinity;
    
    if (current < bestTimeValue) {
        bestTimes.value[diff] = { time: current, name: currentPlayerName.value };
        localStorage.setItem('sudoku_best_times', JSON.stringify(bestTimes.value));
    }
}

// Actions
function initiateGameStart(diff: Difficulty) {
    pendingDifficulty.value = diff;
    showNameModal.value = true;
}

function handleNameConfirm(name: string) {
    currentPlayerName.value = name;
    showNameModal.value = false;
    if (pendingDifficulty.value) {
        startGame(pendingDifficulty.value);
    }
}

function cancelNameInput() {
    showNameModal.value = false;
    pendingDifficulty.value = '';
}

function startGame(diff: Difficulty) {
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
}

function handleCellSelect(coords: { row: number, col: number }) {
  selectedCell.value = coords;
}

function handleInput(num: number) {
  if (!selectedCell.value || gameWon.value) return;
  const { row, col } = selectedCell.value;
  if (initialBoard.value[row] && initialBoard.value[row][col] !== BLANK) return;
  if (board.value[row]) {
    board.value[row][col] = num;
    checkWin();
  }
}

function isBoardFull() {
  if (!board.value.length) return false;
  return board.value.every(row => row.every(cell => cell !== BLANK));
}

function checkWin() {
  if (isBoardFull()) {
     let correct = true;
     for(let r=0; r<9; r++) {
         const row = board.value[r];
         const solRow = solution.value[r];
         if (!row || !solRow) {
             correct = false;
             break;
         }
         for(let c=0; c<9; c++) {
             if (row[c] !== solRow[c]) correct = false;
         }
     }
     if (correct) {
         gameWon.value = true;
         stopTimerAction();
         saveBestTime();
     }
  }
}

function handleKeydown(e: KeyboardEvent) {
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

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// Tailwind Classes
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
                 <div class="flex justify-between items-center px-4 py-3 rounded-lg bg-white/5 border border-white/5" v-for="diff in (['easy', 'medium', 'hard'] as const)" :key="'score-'+diff">
                     <span class="uppercase text-xs tracking-wider font-bold text-text-secondary w-16">{{ diff }}</span>
                     <div class="flex flex-col items-end">
                         <span class="font-mono text-lg text-white font-bold leading-none">
                            {{ bestTimes[diff] ? formatTime(typeof bestTimes[diff] === 'number' ? (bestTimes[diff] as any) : bestTimes[diff]!.time) : '--:--' }}
                         </span>
                         <span v-if="bestTimes[diff] && typeof bestTimes[diff] === 'object' && bestTimes[diff]!.name" class="text-xs text-accent mt-1">
                             {{ bestTimes[diff]!.name }}
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
                   v-for="diff in (['easy', 'medium', 'hard'] as const)"
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

<style lang="scss">
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
}
</style>
