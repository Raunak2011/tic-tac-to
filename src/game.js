export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export const EMPTY_BOARD = Array(9).fill(null);

export const MODES = [
  { id: 'chill', label: 'Chill CPU', short: 'Chill', desc: 'Makes a mistake now and then. A friendly warm-up.', icon: '🌱', tint: 'green', tag: 'EASY' },
  { id: 'sharp', label: 'Sharp CPU', short: 'Sharp', desc: 'Never misses a line. Hold it to a draw and call it a win.', icon: '🧠', tint: 'pink', tag: 'HARD' },
  { id: 'duo', label: 'Two players', short: 'Friend', desc: 'Same phone, two thumbs, zero excuses. Pass and play.', icon: '🤝', tint: 'blue', tag: 'LOCAL' },
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

const minimax = (board, player) => {
  const outcome = getOutcome(board);
  if (outcome) {
    if (outcome.winner === 'O') return 10;
    if (outcome.winner === 'X') return -10;
    return 0;
  }
  const scores = [];
  for (let i = 0; i < 9; i += 1) {
    if (board[i]) continue;
    const next = [...board];
    next[i] = player;
    scores.push(minimax(next, player === 'O' ? 'X' : 'O'));
  }
  return player === 'O' ? Math.max(...scores) : Math.min(...scores);
};

export const findBestMove = (board) => {
  let bestScore = -Infinity;
  let bestIndex = -1;
  for (let i = 0; i < 9; i += 1) {
    if (board[i]) continue;
    const next = [...board];
    next[i] = 'O';
    const score = minimax(next, 'X');
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  return bestIndex;
};
