import Link from "next/link";

export default function DisplayFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link className="nav-logo" href="/" aria-label="YaleClubs home">
            ♣
          </Link>
          <div>
            Find your community<small>A student-run directory of Yale clubs and events.</small>
            <small>A Yale Computer Society and Design at Yale product.</small>
          </div>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Explore</h4>
            <Link href="/Events">Events</Link>
            <Link href="/">Catalog</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link href="/faq">FAQ</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <a href="https://yaleclubs.canny.io" target="_blank" rel="noopener noreferrer">
              Feedback
            </a>
          </div>
          <div>
            <h4>About</h4>
            <Link href="/about">Team</Link>
            <Link href="/release-notes">Release Notes</Link>
            <a href="https://github.com/YaleComputerSociety/yaleclubs" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>
      <p className="copyright">© {new Date().getFullYear()} YaleClubs</p>
    </footer>
  );
}
