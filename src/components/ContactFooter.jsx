import useRevealOnScroll from '../hooks/useRevealOnScroll'
import './ContactFooter.css'

// Real brand marks, inlined as SVG path data rather than fetched from an
// icon CDN -- this project keeps every asset self-contained (segmented
// photo layers, self-hosted font file, no external image hosts anywhere
// else), and a CDN icon is one more thing that can silently fail to load
// depending on network policy, ad blockers, or privacy extensions. A
// blank circle where a GitHub mark should be is worse than the plain-text
// link it would be replacing.
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  )
}

// Placeholder email + social hrefs -- swap in the real ones. Kept as a
// small data array (not hardcoded markup per link) so adding/removing a
// platform later is a one-line change, not a layout edit.
const EMAIL = 'hello@example.com'
const SOCIALS = [
  { label: 'GitHub', Icon: GitHubIcon, href: 'https://github.com/' },
  { label: 'LinkedIn', Icon: LinkedInIcon, href: 'https://linkedin.com/' },
  { label: 'X', Icon: XIcon, href: 'https://x.com/' },
]

export default function ContactFooter() {
  const [ref, visible] = useRevealOnScroll()
  return (
    <footer ref={ref} className={`contact-footer${visible ? ' is-visible' : ''}`} id="contact">
      {/* The heading itself is the CTA, not a static label sitting above a
          separate small link -- large clickable typography reads as a
          considered closing statement rather than a filled-in footer
          template. The literal address stays underneath, smaller, for
          anyone who wants to read or copy it directly. */}
      <h2 className="contact-footer__cta">
        <a href={`mailto:${EMAIL}`}>Get in touch</a>
      </h2>
      <a className="contact-footer__email" href={`mailto:${EMAIL}`}>
        {EMAIL}
      </a>
      <nav className="contact-footer__socials" aria-label="Social links">
        {SOCIALS.map(({ label, Icon, href }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
            <Icon />
          </a>
        ))}
      </nav>
      {/* A single-page scroll site has no persistent nav, so these are the
          only way back to the top or across to the work section without
          scrolling by hand -- real navigation, not decoration standing in
          for content. */}
      <nav className="contact-footer__links" aria-label="Quick links">
        <a href="#top">Back to top</a>
        <a href="#work">Selected work</a>
      </nav>
      <p className="contact-footer__meta">The Hollow, {new Date().getFullYear()}</p>
    </footer>
  )
}
