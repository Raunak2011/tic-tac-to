import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, RotateCcw, Sparkles } from 'lucide-react';
import Brand from '../components/Brand.jsx';
import AppFooter from '../components/AppFooter.jsx';

const pad = (value) => String(value).padStart(2, '0');

const toInputValue = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const utcDay = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
const daysBetween = (from, to) => Math.round((utcDay(to) - utcDay(from)) / 86400000);

const addMonths = (date, months) => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const day = Math.min(date.getDate(), daysInMonth(target.getFullYear(), target.getMonth()));
  return new Date(target.getFullYear(), target.getMonth(), day);
};

const breakDownAge = (birth, at) => {
  let months = (at.getFullYear() - birth.getFullYear()) * 12 + (at.getMonth() - birth.getMonth());
  if (addMonths(birth, months) > at) months -= 1;
  const anchor = addMonths(birth, months);
  return {
    years: Math.floor(months / 12),
    months: ((months % 12) + 12) % 12,
    days: daysBetween(anchor, at),
    totalMonths: months,
  };
};

const nextBirthday = (birth, at) => {
  const build = (year) => {
    const day = Math.min(birth.getDate(), daysInMonth(year, birth.getMonth()));
    return new Date(year, birth.getMonth(), day);
  };
  let next = build(at.getFullYear());
  if (next < new Date(at.getFullYear(), at.getMonth(), at.getDate())) {
    next = build(at.getFullYear() + 1);
  }
  return next;
};

export default function AgeCalculator() {
  const today = useMemo(() => new Date(), []);
  const [birthValue, setBirthValue] = useState('');
  const [atValue, setAtValue] = useState(toInputValue(today));

  const birth = parseDate(birthValue);
  const at = parseDate(atValue);

  const result = useMemo(() => {
    if (!birth || !at) return null;
    if (birth > at) {
      return { error: 'Date of birth must be on or before the target date.' };
    }
    const age = breakDownAge(birth, at);
    const totalDays = daysBetween(birth, at);
    const birthday = nextBirthday(birth, at);
    return {
      ...age,
      totalDays,
      totalWeeks: Math.floor(totalDays / 7),
      leftoverDays: totalDays % 7,
      birthday,
      daysToBirthday: daysBetween(at, birthday),
      weekday: birth.toLocaleDateString(undefined, { weekday: 'long' }),
    };
  }, [birth, at]);

  const reset = () => {
    setBirthValue('');
    setAtValue(toInputValue(today));
  };

  const dateLabel = (date) =>
    date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <main className="app-shell">
      <header className="topbar">
        <Brand />
        <span className="top-label"><span className="online-dot" /> CALENDAR MATH</span>
      </header>

      <div className="crumb-bar">
        <a className="back-link" href="#/"><ChevronLeft size={13} /> ALL TOOLS</a>
        <span className="crumb-current">TOOL 01 — AGE CALCULATOR</span>
      </div>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={13} /> EVERY DAY COUNTS</div>
        <h1>Exactly how<br /><span>old are you?</span></h1>
        <p>Drop in a birth date and get your age in years, months and days — plus the wait until your next birthday.</p>
      </section>

      <section className="stage">
        <div className="game-card age-card">
          <div className="card-label">YOUR DATES <span>01 — 02</span></div>

          <div className="field-row">
            <label className="field">
              <span>DATE OF BIRTH</span>
              <input
                type="date"
                value={birthValue}
                max={atValue || undefined}
                onChange={(event) => setBirthValue(event.target.value)}
              />
            </label>
            <label className="field">
              <span>AGE AT DATE</span>
              <input
                type="date"
                value={atValue}
                onChange={(event) => setAtValue(event.target.value)}
              />
            </label>
          </div>

          <button
            className="ghost-action age-reset"
            onClick={reset}
            disabled={!birthValue && atValue === toInputValue(today)}
          >
            <RotateCcw size={12} /> RESET
          </button>

          {result?.error && (
            <div className="tool-error">{result.error}</div>
          )}

          {!birthValue && (
            <div className="tool-empty">
              <CalendarDays size={26} />
              <b>Pick a birth date to start</b>
              <span>The maths updates the moment you choose a day.</span>
            </div>
          )}

          {birthValue && !result?.error && !result && (
            <div className="tool-empty">
              <CalendarDays size={26} />
              <b>Add a target date</b>
              <span>Choose the day to measure against — today works fine.</span>
            </div>
          )}

          {birthValue && !result?.error && result && (
            <div className="age-result">
              <div className="age-grid">
                <div className="age-unit">
                  <b>{result.years}</b>
                  <span>YEARS</span>
                </div>
                <div className="age-unit">
                  <b>{result.months}</b>
                  <span>MONTHS</span>
                </div>
                <div className="age-unit">
                  <b>{result.days}</b>
                  <span>DAYS</span>
                </div>
              </div>

              <div className="stat-list">
                <div className="stat-row">
                  <span>Total days lived</span>
                  <b>{result.totalDays.toLocaleString()}</b>
                </div>
                <div className="stat-row">
                  <span>Total weeks</span>
                  <b>{result.totalWeeks.toLocaleString()} <small>+ {result.leftoverDays}d</small></b>
                </div>
                <div className="stat-row">
                  <span>Total months</span>
                  <b>{result.totalMonths.toLocaleString()}</b>
                </div>
                <div className="stat-row">
                  <span>Born on a</span>
                  <b>{result.weekday}</b>
                </div>
                <div className="stat-row highlight">
                  <span>Next birthday</span>
                  <b>
                    {result.daysToBirthday === 0
                      ? 'Today! 🎉'
                      : `${result.daysToBirthday} day${result.daysToBirthday === 1 ? '' : 's'}`}
                    <small>{dateLabel(result.birthday)}</small>
                  </b>
                </div>
              </div>
            </div>
          )}

          <div className="card-hint">DATES USE THIS DEVICE'S TIME ZONE</div>
        </div>
      </section>

      <AppFooter note="MAKE THE DAYS COUNT" />
    </main>
  );
}
