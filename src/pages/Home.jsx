import { ArrowUpRight, Sparkles } from 'lucide-react';
import Brand from '../components/Brand.jsx';
import AppFooter from '../components/AppFooter.jsx';
import { TOOLS } from '../tools.jsx';

function ToolCard({ tool, index }) {
  const Icon = tool.icon;
  return (
    <a
      className={`tool-card ${tool.status}`}
      href={`#${tool.path}`}
      style={{ '--accent': tool.accent, '--accent-soft': tool.soft }}
      aria-label={`Open ${tool.name}`}
    >
      <span className="tool-top">
        <span className="tool-icon"><Icon size={21} /></span>
        <span className="tool-index">{String(index + 1).padStart(2, '0')}</span>
      </span>
      <span className="tool-name">{tool.name}</span>
      <span className="tool-desc">{tool.tagline}</span>
      <span className="tool-foot">
        <span className={`tool-status ${tool.status}`}>
          <span className="status-pip" aria-hidden="true" />
          {tool.status === 'live' ? 'LIVE' : 'SOON'}
        </span>
        <span className="tool-open">OPEN <ArrowUpRight size={13} /></span>
      </span>
    </a>
  );
}

export default function Home() {
  return (
    <main className="app-shell hub-shell">
      <header className="topbar">
        <Brand />
        <div className="top-meta">
          <span className="top-label">
            <span className="online-dot" />
            {TOOLS.length} TOOLS ONLINE
          </span>
        </div>
      </header>

      <section className="hub-hero">
        <div className="eyebrow"><Sparkles size={13} /> POCKET TOOLKIT</div>
        <h1>Everything you need.<br /><span>One tap away.</span></h1>
        <p>Calculators, a quick game and a camera — all in one place. No installs, no clutter, nothing to dig through.</p>
      </section>

      <section className="hub-stage">
        <div className="section-head">
          <span>ALL TOOLS</span>
          <span>01 — {String(TOOLS.length).padStart(2, '0')}</span>
        </div>
        <div className="tool-grid">
          {TOOLS.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
        <p className="hub-note">More tools are on the way — this shelf keeps growing.</p>
      </section>

      <AppFooter />
    </main>
  );
}
