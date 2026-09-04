import './ContactFooter.css'

// Placeholder email + social hrefs -- swap in the real ones. Kept as a
// small data array (not hardcoded markup per link) so adding/removing a
// platform later is a one-line change, not a layout edit.
const EMAIL = 'hello@example.com'
const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/' },
  { label: 'LinkedIn', href: 'https://linkedin.com/' },
  { label: 'X / Twitter', href: 'https://x.com/' },
]

export default function ContactFooter() {
  return (
    <footer className="contact-footer" id="contact">
      <h2>Let's talk</h2>
      <a className="contact-footer__email" href={`mailto:${EMAIL}`}>
        {EMAIL}
      </a>
      <nav className="contact-footer__socials" aria-label="Social links">
        {SOCIALS.map((social) => (
          <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
            {social.label}
          </a>
        ))}
      </nav>
      <p className="contact-footer__meta">The Hollow &mdash; {new Date().getFullYear()}</p>
    </footer>
  )
}
