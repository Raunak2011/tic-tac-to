export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export const EMPTY_BOARD = Array(9).fill(null);

export const MODES = [
  { id: 'chill', label: 'NORMAL MODE', short: 'Chill', desc: 'For the beginners to start learning.', tint: 'green', tag: 'NORMAL' },
  { id: 'sharp', label: 'HARD MODE', short: 'Sharp', desc: 'So hard even a draw is called a win.', tint: 'pink', tag: 'HARD' },
  { id: 'duo', label: 'TWO PLAYERS', short: 'Friend', desc: 'For the fun of pass and play.', tint: 'blue', tag: 'LOCAL' },
];

export const getOutcome = (board) => {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return board.every(Boolean) ? { winner: 'draw', line: [] } : null;
};

const emptyCells = (board) => board.reduce((acc, cell, index) => (cell ? acc : [...acc, index]), []);

const findImmediateWin = (board, player) => {
  for (const index of emptyCells(board)) {
    const next = [...board];
    next[index] = player;
    if (getOutcome(next)?.winner === player) return index;
  }
  return -1;
};

const minimax = (board, current, me) => {
  const outcome = getOutcome(board);
  if (outcome) {
    if (outcome.winner === 'draw') return 0;
    return outcome.winner === me ? 10 : -10;
  }

  const maximizing = current === me;
  const nextPlayer = current === 'X' ? 'O' : 'X';
  let best = maximizing ? -Infinity : Infinity;

  for (const index of emptyCells(board)) {
    const next = [...board];
    next[index] = current;
    const score = minimax(next, nextPlayer, me);
    best = maximizing ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
};

export const findBestMove = (board, player = 'O') => {
  const nextPlayer = player === 'X' ? 'O' : 'X';
  let bestScore = -Infinity;
  let bestIndex = -1;

  for (const index of emptyCells(board)) {
    const next = [...board];
    next[index] = player;
    const score = minimax(next, nextPlayer, player);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }
  return bestIndex;
};

// Human-ish opponent: always finishes a win, usually blocks, and otherwise
// leans toward the centre and corners while still making the odd mistake.
export const findChillMove = (board, player = 'O') => {
  const empty = emptyCells(board);
  if (!empty.length) return -1;

  const win = findImmediateWin(board, player);
  if (win !== -1) return win;

  const opponent = player === 'X' ? 'O' : 'X';
  const threat = findImmediateWin(board, opponent);
  if (threat !== -1 && Math.random() < 0.85) return threat;

  const preferred = [];
  if (!board[4]) preferred.push(4);
  [0, 2, 6, 8].forEach((index) => { if (!board[index]) preferred.push(index); });
  [1, 3, 5, 7].forEach((index) => { if (!board[index]) preferred.push(index); });

  if (Math.random() < 0.85) {
    return preferred[Math.floor(Math.random() * Math.min(preferred.length, 3))];
  }
  return empty[Math.floor(Math.random() * empty.length)];
};
