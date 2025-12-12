/**
 * Sudoku Game Logic
 */

// Constants
export const BLANK = 0;
export const GRID_SIZE = 9;
export const BOX_SIZE = 3;

/**
 * Checks if a move is valid in the current board state
 * @param {Array<Array<number>>} board 9x9 grid
 * @param {number} row 0-8
 * @param {number} col 0-8
 * @param {number} num 1-9
 * @returns {boolean}
 */
export function isValidMove(board, row, col, num) {
    // Check row and column
    for (let i = 0; i < GRID_SIZE; i++) {
        if (board[row][i] === num && i !== col) return false;
        if (board[i][col] === num && i !== row) return false;
    }

    // Check 3x3 box
    const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

    for (let i = 0; i < BOX_SIZE; i++) {
        for (let j = 0; j < BOX_SIZE; j++) {
            if (board[startRow + i][startCol + j] === num) {
                if ((startRow + i) !== row || (startCol + j) !== col) return false;
            }
        }
    }

    return true;
}

/**
 * Solves the Sudoku board using backtracking
 * @param {Array<Array<number>>} board 
 * @returns {boolean} true if solvable
 */
export function solveSudoku(board) {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (board[row][col] === BLANK) {
                // Try numbers 1-9
                const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                // Randomize for generation variety if needed, but for strict solver standard order is fine.
                // For generation we usually shuffle.

                for (let num of nums) {
                    if (isValidMove(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) return true;
                        board[row][col] = BLANK;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

/**
 * Generates a filled 9x9 Sudoku board
 * @returns {Array<Array<number>>}
 */
function generateFullBoard() {
    const board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(BLANK));

    // Custom solver with randomization for generation
    function fill(board) {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (board[row][col] === BLANK) {
                    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                    for (let num of nums) {
                        if (isValidMove(board, row, col, num)) {
                            board[row][col] = num;
                            if (fill(board)) return true;
                            board[row][col] = BLANK;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    fill(board);
    return board;
}

/**
 * Generates a new game board based on difficulty
 * @param {string} difficulty 'easy' | 'medium' | 'hard'
 * @returns {object} { initialBoard, solution }
 */
export function generateNewGame(difficulty = 'easy') {
    const solution = generateFullBoard();
    // Deep copy for the puzzle board
    const puzzle = solution.map(row => [...row]);

    let attempts = difficulty === 'hard' ? 50 : difficulty === 'medium' ? 40 : 30;
    // This is a naive removal strategy. A better one ensures unique solution, 
    // but for this task, random removal is usually sufficient for a basic game.
    // Standard clues: Easy ~36-49, Medium ~32-35, Hard ~28-31
    // Let's remove cells.

    let cellsToRemove = difficulty === 'hard' ? 55 : difficulty === 'medium' ? 45 : 30;

    while (cellsToRemove > 0) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        if (puzzle[row][col] !== BLANK) {
            puzzle[row][col] = BLANK;
            cellsToRemove--;
        }
    }

    return {
        initial: puzzle.map(row => [...row]), // The starting state (immutable)
        solution: solution, // The answer key
        current: puzzle.map(row => [...row])  // The state the user interacts with (if needed here, else managed in component)
    };
}
