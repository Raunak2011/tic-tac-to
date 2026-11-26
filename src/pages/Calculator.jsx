import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Delete, Sparkles } from 'lucide-react';
import Brand from '../components/Brand.jsx';
import AppFooter from '../components/AppFooter.jsx';

const OPERATORS = {
  '+': (a, b) => a + b,
  '−': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => (b === 0 ? NaN : a / b),
};

const format = (value) => {
  if (!Number.isFinite(value)) return 'Error';
  const rounded = Number.parseFloat(value.toPrecision(12));
  if (!Number.isFinite(rounded)) return 'Error';
  return String(rounded);
};

const KEYS = [
  { label: 'AC', type: 'fn', action: 'clear' },
  { label: '±', type: 'fn', action: 'sign' },
  { label: '%', type: 'fn', action: 'percent' },
  { label: '÷', type: 'op', action: 'op', value: '÷' },
  { label: '7', type: 'num' },
  { label: '8', type: 'num' },
  { label: '9', type: 'num' },
  { label: '×', type: 'op', action: 'op', value: '×' },
  { label: '4', type: 'num' },
  { label: '5', type: 'num' },
  { label: '6', type: 'num' },
  { label: '−', type: 'op', action: 'op', value: '−' },
  { label: '1', type: 'num' },
  { label: '2', type: 'num' },
  { label: '3', type: 'num' },
  { label: '+', type: 'op', action: 'op', value: '+' },
  { label: '0', type: 'num', wide: true },
  { label: '.', type: 'num', action: 'dot' },
  { label: '=', type: 'eq', action: 'equals' },
];

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [stored, setStored] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(true);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState([]);

  const caption = useMemo(() => {
    if (error) return 'ERROR';
    if (operator && stored !== null) return `${format(stored)} ${operator}`;
    if (history.length) return `${history[0].expression} =`;
    return 'READY';
  }, [error, operator, stored, history]);

  const fail = () => {
    setDisplay('Error');
    setError(true);
    setStored(null);
    setOperator(null);
    setOverwrite(true);
  };

  const clear = () => {
    setDisplay('0');
    setStored(null);
    setOperator(null);
    setOverwrite(true);
    setError(false);
  };

  const digit = (value) => {
    if (error) clear();
    if (overwrite) {
      setDisplay(value === '.' ? '0.' : value);
      setOverwrite(false);
      return;
    }
    setDisplay((prev) => {
      if (value === '.' && prev.includes('.')) return prev;
      if (prev === '0' && value !== '.') return value;
      if (prev.replace('-', '').replace('.', '').length >= 12) return prev;
      return prev + value;
    });
  };

  const sign = () => {
    if (error) return;
    setDisplay((prev) => (prev === '0' ? prev : prev.startsWith('-') ? prev.slice(1) : `-${prev}`));
  };

  const percent = () => {
    if (error) return;
    const value = Number(display) / 100;
    if (!Number.isFinite(value)) return fail();
    setDisplay(format(value));
    setOverwrite(true);
  };

  const applyOperator = (nextOperator) => {
    if (error) return clear();
    const current = Number(display);

    if (operator && !overwrite) {
      const result = OPERATORS[operator](stored, current);
      if (!Number.isFinite(result)) return fail();
      setStored(result);
      setDisplay(format(result));
    } else if (stored === null || !operator) {
      setStored(current);
    }

    setOperator(nextOperator);
    setOverwrite(true);
  };

  const equals = () => {
    if (error || !operator || stored === null) return;
    const current = Number(display);
    const result = OPERATORS[operator](stored, current);
    if (!Number.isFinite(result)) return fail();

    const value = format(result);
    setHistory((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        expression: `${format(stored)} ${operator} ${format(current)}`,
        result: value,
      },
      ...prev,
    ].slice(0, 6));
    setDisplay(value);
    setStored(null);
    setOperator(null);
    setOverwrite(true);
  };

  const backspace = () => {
    if (error) return clear();
    if (overwrite) {
      setDisplay('0');
      return;
    }
    setDisplay((prev) => {
      const next = prev.slice(0, -1);
      return next === '' || next === '-' ? '0' : next;
    });
  };

  const press = (key) => {
    if (key.action === 'clear') return clear();
    if (key.action === 'sign') return sign();
    if (key.action === 'percent') return percent();
    if (key.action === 'op') return applyOperator(key.value);
    if (key.action === 'dot') return digit('.');
    if (key.action === 'equals') return equals();
    return digit(key.label);
  };

  const recall = (value) => {
    setDisplay(value);
    setStored(null);
    setOperator(null);
    setOverwrite(true);
    setError(false);
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const { key } = event;

      if (/^[0-9]$/.test(key)) {
        event.preventDefault();
        digit(key);
      } else if (key === '.' || key === ',') {
        event.preventDefault();
        digit('.');
      } else if (key === '+' || key === '-' || key === '*' || key === 'x' || key === 'X' || key === '/') {
        event.preventDefault();
        const map = { '*': '×', x: '×', X: '×', '/': '÷', '-': '−' };
        applyOperator(map[key] ?? key);
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        equals();
      } else if (key === 'Backspace') {
        event.preventDefault();
        backspace();
      } else if (key === 'Escape' || key === 'Delete' || key === 'c' || key === 'C') {
        event.preventDefault();
        clear();
      } else if (key === '%') {
        event.preventDefault();
        percent();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <Brand />
        <span className="top-label"><span className="online-dot" /> NUMBER CRUNCHER</span>
      </header>

      <div className="crumb-bar">
        <a className="back-link" href="#/"><ChevronLeft size={13} /> ALL TOOLS</a>
        <span className="crumb-current">TOOL 02 — CALCULATOR</span>
      </div>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={13} /> QUICK MATHS, NO CLUTTER</div>
        <h1>Tap it out.<br /><span>Get the answer.</span></h1>
        <p>Everyday arithmetic with a big screen, a friendly keypad and your last few answers kept in reach.</p>
      </section>

      <section className="stage">
        <div className="game-card calc-card">
          <div className="calc-display" aria-live="polite">
            <button className="calc-back" onClick={backspace} aria-label="Backspace">
              <Delete size={17} />
            </button>
            <span className="calc-caption">{caption}</span>
            <span className={`calc-value ${error ? 'is-error' : ''}`}>{display}</span>
          </div>

          <div className="keypad" role="group" aria-label="Calculator keypad">
            {KEYS.map((key) => (
              <button
                key={key.label}
                className={`key ${key.type} ${key.wide ? 'wide' : ''}`}
                onClick={() => press(key)}
                aria-label={key.label === 'AC' ? 'Clear' : key.label === '±' ? 'Toggle sign' : key.label}
              >
                {key.label}
              </button>
            ))}
          </div>

          <div className="calc-history">
            <div className="history-head">
              <span>LAST ANSWERS</span>
              {history.length > 0 && (
                <button className="history-clear" onClick={() => setHistory([])}>CLEAR</button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="history-empty">Your recent sums will land here.</p>
            ) : (
              <ul className="history-list">
                {history.map((item) => (
                  <li key={item.id}>
                    <button className="history-item" onClick={() => recall(item.result)} title="Use this answer">
                      <span className="history-expression">{item.expression} =</span>
                      <span className="history-result">{item.result}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card-hint">KEYS 0–9 · + − × ÷ · ENTER = · ESC CLEARS</div>
        </div>
      </section>

      <AppFooter note="NUMBERS, HANDLED" />
    </main>
  );
}
