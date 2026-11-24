import { useEffect, useState } from 'react';
import Home from './pages/Home.jsx';
import AgeCalculator from './pages/AgeCalculator.jsx';
import Calculator from './pages/Calculator.jsx';
import TicTacToe from './pages/TicTacToe.jsx';
import CameraApp from './pages/CameraApp.jsx';

const ROUTES = {
  '/': Home,
  '/age-calculator': AgeCalculator,
  '/calculator': Calculator,
  '/tic-tac-toe': TicTacToe,
  '/camera': CameraApp,
};

const readRoute = () => {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return '/';
  return hash.startsWith('/') ? hash : `/${hash}`;
};

function NotFound() {
  return (
    <main className="app-shell hub-shell">
      <section className="hub-hero">
        <div className="eyebrow">404 — NOT IN THE BOX</div>
        <h1>This tool<br /><span>doesn&apos;t exist.</span></h1>
        <p>The shortcut you followed is stale. Head home and pick another one.</p>
        <a className="start-button hub-cta" href="#/"><span>BACK TO ALL TOOLS</span></a>
      </section>
    </main>
  );
}

export default function App() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(readRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const Page = ROUTES[route] ?? NotFound;
  return <Page />;
}
