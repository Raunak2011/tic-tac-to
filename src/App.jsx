import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bot, Brain, Circle, Handshake, Leaf, Play, RotateCcw, Sparkles, Trophy, Users, X } from 'lucide-react';
import { EMPTY_BOARD, MODES, findBestMove, findChillMove, getOutcome } from './game.js';

const MODE_ICONS = { chill: Leaf, sharp: Brain, duo: Users };

export default function App() {
  const [mode, setMode] = useState(null);
  const [phase, setPhase] = useState('ready');
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [turn, setTurn] = useState('X');
  const [result, setResult] = useState(null);
  const [round, setRound] = useState(1);
  const [playerMark, setPlayerMark] = useState('X');

  const cpuMark = playerMark === 'X' ? 'O' : 'X';

  const clearBoard = () => {
    setBoard(EMPTY_BOARD);
    setTurn('X');
    setResult(null);
  };

  const startMatch = (selected = mode) => {
    if (!selected) return;
    setMode(selected);
    setRound(1);
    clearBoard();
    setPhase('playing');
  };

  const nextRound = () => {
    setRound((value) => value + 1);
    clearBoard();
    setPhase('playing');
  };

  const backToSetup = () => {
    setPhase('ready');
    setRound(1);
    clearBoard();
  };

  const chooseMark = (mark) => {
    if (mark === playerMark) return;
    setPlayerMark(mark);
    if (phase === 'playing') {
      setRound(1);
      clearBoard();
    }
  };

  const placeMark = useCallback((index, actor = 'human') => {
    if (phase !== 'playing' || result || board[index]) return;
    if (actor === 'human' && mode !== 'duo' && turn !== playerMark) return;

    const next = [...board];
    next[index] = turn;
    setBoard(next);

    const outcome = getOutcome(next);
    if (!outcome) {
      setTurn(turn === 'X' ? 'O' : 'X');
      return;
    }

    setResult(outcome);
  }, [phase, result, board, mode, turn, playerMark]);

  useEffect(() => {
    if (phase !== 'playing' || result || mode === 'duo' || mode === null || turn !== cpuMark) return undefined;

    const timer = window.setTimeout(() => {
      const empties = board.reduce((acc, cell, index) => (cell ? acc : [...acc, index]), []);
      if (!empties.length) return;
      const pick = mode === 'sharp'
        ? findBestMove(board, cpuMark)
        : findChillMove(board, cpuMark);
      placeMark(pick, 'cpu');
    }, 180);

    return () => window.clearTimeout(timer);
  }, [phase, result, mode, turn, board, placeMark, cpuMark]);

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
    if (mode === 'duo') {
      return {
        kicker: `${result.winner} TAKES IT`,
        title: <>Player {result.winner}<br /><span>takes it.</span></>,
        body: `Player ${result.winner} takes the round. Hand the phone back.`,
      };
    }
    if (result.winner === playerMark) {
      return {
        kicker: 'YOU TAKE IT',
        title: <>You got<br /><span>three.</span></>,
        body: 'You beat the machine. Rare and beautiful.',
      };
    }
    return {
      kicker: 'CPU TAKES IT',
      title: <>Three in<br /><span>a row.</span></>,
      body: 'The CPU found the line. Try again?',
    };
  }, [result, mode, playerMark]);

  const statusText = result
    ? result.winner === 'draw' ? 'DRAW' : `${result.winner} WINS`
    : mode === 'duo'
      ? (turn === 'X' ? 'PLAYER X' : 'PLAYER O')
      : turn === playerMark ? 'YOUR TURN' : 'CPU THINKING';

  const cpuThinking = !result && phase === 'playing' && mode !== 'duo' && turn === cpuMark;

  return (
    <main className={`app-shell ${phase === 'playing' ? 'is-playing' : ''}`}>
      <header className="topbar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); backToSetup(); }}>
          <span className="brand-mark" aria-hidden="true" />
          <span>tic tac <span className="brand-accent">toe</span></span>
        </a>
        <div className="top-meta">
          <span className="top-label"><span className="online-dot" /> CLASSIC BOARD GAME</span>
          {mode !== 'duo' && (
            <div className="mark-switch" role="group" aria-label="Choose your mark">
              <span className="mark-switch-label">PLAY AS</span>
              <div className="mark-options">
                <button
                  className={`mark-option x ${playerMark === 'X' ? 'active' : ''}`}
                  onClick={() => chooseMark('X')}
                  aria-pressed={playerMark === 'X'}
                  aria-label="Play as X"
                >
                  <X size={12} />X
                </button>
                <button
                  className={`mark-option o ${playerMark === 'O' ? 'active' : ''}`}
                  onClick={() => chooseMark('O')}
                  aria-pressed={playerMark === 'O'}
                  aria-label="Play as O"
                >
                  <Circle size={11} />O
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={13} /> THREE IN A ROW, NO MERCY</div>
        <h1>X versus O.<br /><span>Claim the grid.</span></h1>
        <p>Pick a rival, claim your squares, and line up three before they do. X always opens — the rest is nerve.</p>
      </section>

      <section className="stage">
        <div className="game-card">
          {phase === 'ready' && (
            <div className="setup">
              <div className="card-label">PICK YOUR MODE <span>01 — 03</span></div>
              <div className="mode-list" role="group" aria-label="Pick your opponent">
                {MODES.map((item, index) => {
                  const ModeIcon = MODE_ICONS[item.id];
                  return (
                    <button
                      key={item.id}
                      className={`mode-row ${mode === item.id ? 'selected' : ''}`}
                      onClick={() => setMode(item.id)}
                      aria-pressed={mode === item.id}
                    >
                      <span className={`mode-icon ${item.id}`}><ModeIcon size={18} /></span>
                      <span className="mode-text">
                        <b>{item.label}</b>
                        <small>{item.desc}</small>
                      </span>
                      <span className="mode-index">0{index + 1}</span>
                    </button>
                  );
                })}
              </div>
              <button className="start-button" onClick={() => startMatch()} disabled={!mode}>
                <span>START GAME</span><Play size={15} fill="currentColor" />
              </button>
              <div className="card-hint">TAP A SQUARE · KEYS 1–9 · R TO RESTART</div>
            </div>
          )}

          {phase === 'playing' && (
            <div className="play">
              <div className="status-row">
                <span className={`turn-badge ${result ? 'done' : turn.toLowerCase()}`}>
                  {result
                    ? (result.winner === 'draw' ? <span className="draw-mark">=</span> : result.winner === 'X' ? <X size={13} /> : <Circle size={13} />)
                    : turn === 'X' ? <X size={13} /> : <Circle size={13} />}
                  <span>{statusText}</span>
                </span>
                <span className="round-chip">ROUND {String(round).padStart(2, '0')}</span>
              </div>

              <div className={`board ${cpuThinking ? 'thinking' : ''}`}>
                {board.map((cell, index) => (
                  <button
                    key={index}
                    className={`cell ${cell ? `mark-${cell.toLowerCase()}` : ''} ${result?.line?.includes(index) ? 'win' : ''}`}
                    onClick={() => placeMark(index)}
                    disabled={Boolean(cell) || Boolean(result) || (mode !== 'duo' && turn !== playerMark)}
                    aria-label={`Square ${index + 1}${cell ? `, ${cell}` : ''}`}
                  >
                    {cell === 'X' && <X />}
                    {cell === 'O' && <Circle />}
                  </button>
                ))}
              </div>

              <div className="actions">
                <button className="primary-action" onClick={nextRound}><RotateCcw size={14} /><span>NEW ROUND</span></button>
                <button className="ghost-action" onClick={backToSetup}>CHANGE OPPONENT</button>
              </div>

              {result && outcomeCopy && (
                <div className="result-overlay">
                  <div className="result-icon">
                    {result.winner === 'draw' ? <Handshake size={40} /> : result.winner === playerMark || mode === 'duo' ? <Trophy size={40} /> : <Bot size={40} />}
                  </div>
                  <div className="result-kicker">{outcomeCopy.kicker}</div>
                  <h2>{outcomeCopy.title}</h2>
                  <p>{outcomeCopy.body}</p>
                  <button className="start-button" onClick={nextRound}><span>PLAY AGAIN</span><RotateCcw size={15} /></button>
                  <button className="change-mode" onClick={backToSetup}>CHANGE OPPONENT</button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <footer className="page-footer">
        <span>TIC TAC TOE © 2026</span>
        <span>X MARKS THE SPOT <span className="footer-heart">♥</span></span>
        <span>NO TAKEBACKS</span>
      </footer>
    </main>
  );
}
