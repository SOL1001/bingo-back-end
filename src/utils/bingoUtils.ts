/**
 * Column ranges for standard Bingo:
 * B: 1–15, I: 16–30, N: 31–45, G: 46–60, O: 61–75
 */
const COLUMN_RANGES: [number, number][] = [
  [1, 15],   // B
  [16, 30],  // I
  [31, 45],  // N
  [46, 60],  // G
  [61, 75],  // O
];

/**
 * Pick `count` unique random integers in [min, max] inclusive.
 */
function pickUnique(min: number, max: number, count: number): number[] {
  const pool: number[] = [];
  for (let i = min; i <= max; i++) pool.push(i);
  // Fisher-Yates shuffle then slice
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/**
 * Generate a 25-element board stored in row-major order.
 * Each column has 5 numbers from its designated range.
 * Layout: board[row * 5 + col]
 * Center cell (index 12) is the FREE space (value = 0).
 */
export function generateBoard(): number[] {
  // Build columns first (5 numbers each)
  const columns: number[][] = COLUMN_RANGES.map(([min, max]) =>
    pickUnique(min, max, 5)
  );

  // Transpose to row-major: board[row][col] = columns[col][row]
  const board: number[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      board.push(columns[col][row]);
    }
  }

  // Center cell is FREE (represented as 0)
  board[12] = 0;

  return board;
}

/**
 * Check if any win pattern is fully marked.
 * `marked` is a Set of board indices that are marked.
 * Index 12 (FREE space) is always considered marked.
 */
export function checkWin(markedIndices: number[]): boolean {
  const markedSet = new Set(markedIndices);
  markedSet.add(12); // FREE space always marked

  // 5 rows
  for (let row = 0; row < 5; row++) {
    const start = row * 5;
    if ([0, 1, 2, 3, 4].every((col) => markedSet.has(start + col))) return true;
  }

  // 5 columns
  for (let col = 0; col < 5; col++) {
    if ([0, 1, 2, 3, 4].every((row) => markedSet.has(row * 5 + col))) return true;
  }

  // Top-left → bottom-right diagonal
  if ([0, 6, 12, 18, 24].every((i) => markedSet.has(i))) return true;

  // Top-right → bottom-left diagonal
  if ([4, 8, 12, 16, 20].every((i) => markedSet.has(i))) return true;

  return false;
}

/**
 * Build the full pool of callable numbers (1–75), shuffled.
 */
export function buildCallPool(): number[] {
  const pool = Array.from({ length: 75 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

/**
 * Return the column letter for a called number.
 */
export function columnLetter(n: number): string {
  if (n <= 15) return 'B';
  if (n <= 30) return 'I';
  if (n <= 45) return 'N';
  if (n <= 60) return 'G';
  return 'O';
}
