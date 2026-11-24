import { ChevronLeft } from 'lucide-react';
import Brand from '../components/Brand.jsx';
import AppFooter from '../components/AppFooter.jsx';
import { TOOLS } from '../tools.jsx';

export default function ToolPlaceholder({ tool, bullets }) {
  const Icon = tool.icon;
  const position = TOOLS.findIndex((item) => item.id === tool.id) + 1;

  return (
    <main className="app-shell tool-page">
      <header className="topbar">
        <Brand />
        <span className="top-label"><span className="online-dot" /> IN THE LAB</span>
      </header>

      <div className="crumb-bar">
        <a className="back-link" href="#/"><ChevronLeft size={13} /> ALL TOOLS</a>
        <span className="crumb-current">
          TOOL {String(position).padStart(2, '0')} — {tool.name.toUpperCase()}
        </span>
      </div>

      <section className="lab-wrap">
        <div className="lab-card" style={{ '--accent': tool.accent, '--accent-soft': tool.soft }}>
          <span className="lab-icon"><Icon size={30} /></span>
          <div className="lab-kicker">{tool.tag} · IN THE LAB</div>
          <h1>{tool.name}</h1>
          <p>{tool.tagline}</p>
          <ul className="lab-list">
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <a className="start-button lab-cta" href="#/">
            <ChevronLeft size={14} /><span>BACK TO ALL TOOLS</span>
          </a>
          <div className="card-hint">SHORTCUT IS READY — THE TOOL LANDS NEXT</div>
        </div>
      </section>

      <AppFooter />
    </main>
  );
}
