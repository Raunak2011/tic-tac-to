import { useCallback, useEffect, useMemo, useState } from 'react';
import { Circle, Flame, Play, RotateCcw, Sparkles, Trophy, Users, X } from 'lucide-react';
import { EMPTY_BOARD, MODES, findBestMove, getOutcome } from './game.js';

export default function App() {
  const [mode, setMode] = useState(null);
  const [phase, setPhase] = useState('ready');
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [turn, setTurn] = useState('X');
  const [result, setResult] = useState(null);
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('ttt-best-streak') || 0));

  const activeMode = MODES.find((item) => item.id === mode);

  const clearBoard = () => {
    setBoard(EMPTY_BOARD);
    setTurn('X');
    setResult(null);
  };

  const startMatch = (selected = mode) => {
    if (!selected) return;
    setMode(selected);
    setScores({ X: 0, O: 0, draws: 0 });
    setStreak(0);
    setRound(1);
    clearBoard();
    setPhase('playing');
  };

  const nextRound = () => {
    setRound((value) => value + 1);
    clearBoard();
    setPhase('playing');
  };

  const backToLobby = () => {
    setPhase('ready');
    setMode(null);
    setScores({ X: 0, O: 0, draws: 0 });
    setStreak(0);
    setRound(1);
    clearBoard();
  };

  const resetMatch = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    setStreak(0);
    setRound(1);
    clearBoard();
    setPhase(mode ? 'playing' : 'ready');
  };

  const placeMark = useCallback((index, actor = 'human') => {
    if (phase !== 'playing' || result || board[index]) return;
    if (actor === 'human' && mode !== 'duo' && turn === 'O') return;

    const next = [...board];
    next[index] = turn;
    setBoard(next);

    const outcome = getOutcome(next);
    if (!outcome) {
      setTurn(turn === 'X' ? 'O' : 'X');
      return;
    }

    setResult(outcome);
    if (outcome.winner === 'draw') {
      setScores((old) => ({ ...old, draws: old.draws + 1 }));
      setStreak(0);
      return;
    }

    setScores((old) => ({ ...old, [outcome.winner]: old[outcome.winner] + 1 }));
    if (outcome.winner === 'X') {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > best) {
        setBest(nextStreak);
        localStorage.setItem('ttt-best-streak', String(nextStreak));
      }
    } else {
      setStreak(0);
    }
  }, [phase, result, board, mode, turn, streak, best]);

  useEffect(() => {
    if (phase !== 'playing' || result || mode === 'duo' || mode === null || turn !== 'O') return undefined;

    const timer = window.setTimeout(() => {
      const empties = board.reduce((acc, cell, index) => (cell ? acc : [...acc, index]), []);
      if (!empties.length) return;
      const pick = mode === 'sharp' || Math.random() < 0.3
        ? findBestMove(board)
        : empties[Math.floor(Math.random() * empties.length)];
      placeMark(pick, 'cpu');
    }, 180);

    return () => window.clearTimeout(timer);
  }, [phase, result, mode, turn, board, placeMark]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        if (phase === 'playing') nextRound();
        else startMatch();
        return;
      }
      const square = Number(event.key);
      if (square >= 1 && square <= 9) placeMark(square - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const outcomeCopy = useMemo(() => {
    if (!result) return null;
    if (result.winner === 'draw') {
      return { kicker: 'DEAD HEAT', title: <>Nobody<br /><span>blinks.</span></>, body: 'Nine squares, no winner. Run it back?' };
    }
    if (result.winner === 'X') {
      return {
        kicker: 'X TAKES IT',
        title: <>You got<br /><span>three.</span></>,
        body: mode === 'duo' ? 'Player X takes the round. Hand the phone back.' : 'You beat the machine. Rare and beautiful.',
      };
    }
    return {
      kicker: 'O TAKES IT',
      title: <>Three in<br /><span>a row.</span></>,
      body: mode === 'duo' ? 'Player O takes the round. Hand the phone back.' : 'The CPU found the line. Try again?',
    };
  }, [result, mode]);

  const statusText = result
    ? result.winner === 'draw' ? 'DRAW' : `${result.winner} WINS`
    : turn === 'X'
      ? (mode === 'duo' ? 'PLAYER X' : 'YOUR TURN')
      : (mode === 'duo' ? 'PLAYER O' : 'CPU THINKING');

  const cpuThinking = !result && phase === 'playing' && mode !== 'duo' && turn === 'O';

  return (
    <main className={`app-shell ${phase === 'playing' ? 'is-playing' : ''}`}>
      <header className="topbar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); backToLobby(); }}>
          <span className="brand-mark" aria-hidden="true" />
          <span>tic tac <span className="brand-accent">toe</span></span>
        </a>
        <div className="top-links">
          <span className="online-dot" /> CLASSIC BOARD GAME <span className="top-divider" />
          <span className="top-best"><Flame size={14} /> BEST STREAK {best}</span>
        </div>
        <button className="reset-button" onClick={resetMatch} aria-label="Reset match">
          <RotateCcw size={15} /><span>RESET MATCH</span>
        </button>
      </header>

      <section className="game-layout">
        <div className="intro-panel">
          <div className="eyebrow"><Sparkles size={14} /> THREE IN A ROW, NO MERCY</div>
          <h1>X versus O.<br />Who&apos;s taking<br /><span>the grid?</span></h1>
          <p className="intro-copy">Pick a rival, claim your squares, and line up three before they do. X always opens. The rest is nerve.</p>
          <div className="howto">
            <div className="howto-icon"><X size={17} /><Circle size={15} /></div>
            <div><b>Tap any empty square</b><span>Three across, down, or diagonal wins</span></div>
          </div>
          <div className="category-label">PICK YOUR OPPONENT <span>01 — 03</span></div>
          <div className="category-grid">
            {MODES.map((item, i) => (
              <button
                key={item.id}
                className={`category-chip ${item.tint} ${mode === item.id ? 'selected' : ''}`}
                onClick={() => { setMode(item.id); setPhase('ready'); clearBoard(); }}
              >
                <span className="chip-emoji">{item.icon}</span>
                <span>{item.label}</span>
                <span className="chip-number">0{i + 1}</span>
              </button>
            ))}
          </div>
          <div className="tip"><span className="tip-spark">✳</span> Keep winning rounds to grow your streak <span className="tip-line" /></div>
        </div>

        <div className="phone-wrap">
          <div className="phone-glow" />
          <div className="phone-frame">
            <div className="phone-notch"><span /><i /></div>
            <div className="phone-screen">
              <div className="screen-top"><span>{activeMode ? activeMode.tag : 'MATCH'}</span><b>Board</b><i /></div>

              {phase === 'ready' && (
                <div className="welcome-card">
                  <div className="welcome-orbit orbit-one" /><div className="welcome-orbit orbit-two" />
                  <div className="welcome-content">
                    <div className="welcome-icon">{activeMode?.icon || '✦'}</div>
                    <div className="welcome-kicker">{activeMode ? 'OPPONENT LOCKED IN' : 'YOUR GRID IS WAITING'}</div>
                    <h2>{activeMode ? activeMode.label : 'Pick your\nopponent'}</h2>
                    <p>{activeMode ? activeMode.desc : 'Chill CPU, sharp CPU, or a friend on the same phone. First to three takes the round.'}</p>
                    <div className="mobile-modes" role="group" aria-label="Pick your opponent">
                      {MODES.map((item) => (
                        <button
                          key={item.id}
                          className={`mobile-mode ${mode === item.id ? 'selected' : ''}`}
                          onClick={() => { setMode(item.id); setPhase('ready'); clearBoard(); }}
                        >
                          <span>{item.icon}</span>{item.short}
                        </button>
                      ))}
                    </div>
                    <button className="start-button" onClick={() => startMatch()} disabled={!mode}>
                      <span>LET&apos;S PLAY</span><Play size={15} fill="currentColor" />
                    </button>
                    <span className="keyboard-hint">TAP A SQUARE · KEYS 1–9</span>
                  </div>
                  <div className="float-emoji emoji-a">✕</div>
                  <div className="float-emoji emoji-b">○</div>
                  <div className="float-emoji emoji-c">✳</div>
                </div>
              )}

              {phase === 'playing' && (
                <div className="board-screen">
                  <div className="match-row">
                    <div className={`turn-badge ${result ? 'done' : turn.toLowerCase()}`}>
                      {result
                        ? (result.winner === 'draw' ? <span className="draw-mark">=</span> : result.winner === 'X' ? <X size={13} /> : <Circle size={13} />)
                        : turn === 'X' ? <X size={13} /> : <Circle size={13} />}
                      <span>{statusText}</span>
                    </div>
                    <span className="round-chip">ROUND {String(round).padStart(2, '0')}</span>
                  </div>

                  <div className="board-wrap">
                    <div className={`board ${cpuThinking ? 'thinking' : ''}`}>
                      {board.map((cell, index) => (
                        <button
                          key={index}
                          className={`cell ${cell ? `mark-${cell.toLowerCase()}` : ''} ${result?.line?.includes(index) ? 'win' : ''}`}
                          onClick={() => placeMark(index)}
                          disabled={Boolean(cell) || Boolean(result) || (mode !== 'duo' && turn === 'O')}
                          aria-label={`Square ${index + 1}${cell ? `, ${cell}` : ''}`}
                        >
                          {cell === 'X' && <X />}
                          {cell === 'O' && <Circle />}
                        </button>
                      ))}
                    </div>
                    <div className="board-hint"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></div>
                  </div>

                  <div className="score-strip">
                    <div className="strip-item x"><b>{scores.X}</b><small>X WINS</small></div>
                    <div className="strip-item draw"><b>{scores.draws}</b><small>DRAWS</small></div>
                    <div className="strip-item o"><b>{scores.O}</b><small>{mode === 'duo' ? 'O WINS' : 'CPU WINS'}</small></div>
                  </div>

                  <div className="board-actions">
                    <button className="primary-action" onClick={nextRound}><RotateCcw size={13} /><span>NEW ROUND</span></button>
                    <button className="ghost-action" onClick={backToLobby}>CHANGE OPPONENT</button>
                  </div>

                  {result && outcomeCopy && (
                    <div className="result-overlay">
                      <div className="result-confetti">✦　✧　✳</div>
                      <div className="welcome-content results-card">
                        <div className="welcome-icon result-icon">
                          {result.winner === 'draw' ? '🤝' : result.winner === 'X' || mode === 'duo' ? '🏆' : '🤖'}
                        </div>
                        <div className="welcome-kicker">{outcomeCopy.kicker}</div>
                        <h2>{outcomeCopy.title}</h2>
                        <p>{outcomeCopy.body}</p>
                        <div className="result-stats">
                          <div><b>{scores.X}</b><small>X WINS</small></div>
                          <div><b>{scores.draws}</b><small>DRAWS</small></div>
                          <div><b>{scores.O}</b><small>O WINS</small></div>
                        </div>
                        <button className="start-button" onClick={nextRound}><span>PLAY AGAIN</span><RotateCcw size={15} /></button>
                        <button className="change-mode" onClick={backToLobby}>CHANGE OPPONENT</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bottom-nav">
                <span className="nav-item active"><span>✕</span>X</span>
                <span className="nav-item"><span>○</span>O</span>
                <span className="nav-add">3</span>
                <span className="nav-item"><span>▦</span>GRID</span>
                <span className="nav-item"><span>✳</span>WIN</span>
              </div>
            </div>
          </div>
          <div className="phone-caption"><span className="live-dot" /> LIVE FROM THE GRID <span className="caption-divider">/</span> <span>THREE IN A ROW</span></div>
        </div>

        <aside className="side-panel">
          <div className="round-label">THE MATCH <span>✳</span></div>
          <div className="score-block">
            <div className="score-number">{String(scores.X).padStart(2, '0')}<span>WINS</span></div>
            <div className="score-caption">X WINS THIS MATCH <span className="streak-indicator"><Flame size={13} /> {streak} STREAK</span></div>
          </div>
          <div className="score-rule" />
          <div className="round-steps">
            <div className={phase === 'playing' ? 'step active' : 'step'}>
              <span className="step-dot">01</span>
              <div><b>Pick your rival</b><small>Chill, sharp, or a friend</small></div>
              {mode && <Users size={14} />}
            </div>
            <div className={phase === 'playing' ? 'step active' : 'step'}>
              <span className="step-dot">02</span>
              <div><b>Claim the grid</b><small>Tap any empty square</small></div>
            </div>
            <div className={result ? 'step active' : 'step'}>
              <span className="step-dot">03</span>
              <div><b>Three in a row</b><small>Across, down, or diagonal</small></div>
              {result?.winner === 'X' && <Trophy size={14} />}
            </div>
          </div>
          <div className="side-note">
            <span>✳</span>
            <p>X always moves first. The <b>sharp CPU</b> never loses — hold it to a draw and you&apos;ve done enough.</p>
          </div>
          <div className="side-foot"><span>MADE FOR QUICK DUELS</span><div><span>✳</span> 2026 <span>✳</span></div></div>
        </aside>
      </section>

      <footer className="page-footer"><span>TIC TAC TOE © 2026</span><span>X MARKS THE SPOT <span className="footer-heart">♥</span></span><span>NO TAKEBACKS</span></footer>
    </main>
  );
}
