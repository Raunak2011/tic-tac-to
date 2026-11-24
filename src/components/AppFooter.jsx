export default function AppFooter({ note = 'SMALL TOOLS, BIG SHORTCUTS' }) {
  return (
    <footer className="page-footer">
      <span>TOOLBOX © 2026</span>
      <span>{note} <span className="footer-heart">♥</span></span>
      <span>RAUNAK</span>
    </footer>
  );
}
