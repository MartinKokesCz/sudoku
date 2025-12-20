/**
 * Sudoku Game Logic
 */

// Constants
export const BLANK = 0;
export const GRID_SIZE = 9;
export const BOX_SIZE = 3;

export type SudokuBoard = number[][];

export interface GameState {
    initial: SudokuBoard;
    solution: SudokuBoard;
    current: SudokuBoard;
}

/**
 * Checks if a move is valid in the current board state
 */
export function isValidMove(board: SudokuBoard, row: number, col: number, num: number): boolean {
    // Check row and column
    for (let i = 0; i < GRID_SIZE; i++) {
        const rowVal = board[row];
        const colVal = board[i];
        if (rowVal && rowVal[i] === num && i !== col) return false;
        if (colVal && colVal[col] === num && i !== row) return false;
    }

    // Check 3x3 box
    const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

    for (let i = 0; i < BOX_SIZE; i++) {
        const currentRow = board[startRow + i];
        if (!currentRow) continue;
        for (let j = 0; j < BOX_SIZE; j++) {
            if (currentRow[startCol + j] === num) {
                if ((startRow + i) !== row || (startCol + j) !== col) return false;
            }
        }
    }

    return true;
}

/**
 * Solves the Sudoku board using backtracking
 */
export function solveSudoku(board: SudokuBoard): boolean {
    for (let row = 0; row < GRID_SIZE; row++) {
        const currentRow = board[row];
        if (!currentRow) continue;
        for (let col = 0; col < GRID_SIZE; col++) {
            if (currentRow[col] === BLANK) {
                const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                for (let num of nums) {
                    if (isValidMove(board, row, col, num)) {
                        currentRow[col] = num;
                        if (solveSudoku(board)) return true;
                        currentRow[col] = BLANK;
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
 */
function generateFullBoard(): SudokuBoard {
    const board: SudokuBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(BLANK));

    function fill(board: SudokuBoard): boolean {
        for (let row = 0; row < GRID_SIZE; row++) {
            const currentRow = board[row];
            if (!currentRow) continue;
            for (let col = 0; col < GRID_SIZE; col++) {
                if (currentRow[col] === BLANK) {
                    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                    for (let num of nums) {
                        if (isValidMove(board, row, col, num)) {
                            currentRow[col] = num;
                            if (fill(board)) return true;
                            currentRow[col] = BLANK;
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
 */
export function generateNewGame(difficulty: string = 'easy'): GameState {
    const solution = generateFullBoard();
    const puzzle = solution.map(row => [...row]);

    let cellsToRemove = difficulty === 'hard' ? 55 : difficulty === 'medium' ? 45 : 30;

    while (cellsToRemove > 0) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        const currentRow = puzzle[row];
        if (currentRow && currentRow[col] !== BLANK) {
            currentRow[col] = BLANK;
            cellsToRemove--;
        }
    }

    return {
        initial: puzzle.map(row => [...row]),
        solution: solution,
        current: puzzle.map(row => [...row])
    };
}
