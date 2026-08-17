import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarDays, CarFront, CheckCircle2, ChevronDown, Clock3, Gauge, Instagram, Mail, MapPin, Menu, Phone, ShieldCheck, Sparkles, Wrench, X } from 'lucide-react'

const services = [
  { icon: Wrench, title: 'Servicing', text: 'Manufacturer-minded servicing that protects performance, reliability and resale value.' },
  { icon: ShieldCheck, title: 'MOT', text: 'Straightforward MOT support with clear advice and no unnecessary upsells.' },
  { icon: Gauge, title: 'Diagnostics', text: 'Modern fault finding with live data and a proper root-cause approach.' },
  { icon: CarFront, title: 'Repairs', text: 'Brakes, suspension, exhausts, clutches and everyday repairs done properly.' },
]

const jobs = [
  { title: 'Brake refresh', vehicle: 'BMW 3 Series', tag: 'Brakes', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=1200&q=85' },
  { title: 'Cooling system repair', vehicle: 'Ford Transit Custom', tag: 'Repairs', image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=85' },
  { title: 'Full service + diagnostics', vehicle: 'Audi A4', tag: 'Servicing', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=85' },
  { title: 'Suspension overhaul', vehicle: 'VW Golf GTI', tag: 'Chassis', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=85' },
]

function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const nav = [
    ['/', 'Home'],
    ['/work', 'Recent Work'],
    ['/mechanic', 'Meet the Mechanic'],
    ['/contact', 'Contact'],
  ]
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">MHR</span>
          <span><strong>AUTO SERVICES</strong><small>Independent garage · diagnostics · repair</small></span>
        </Link>
        <button className="menu-button" aria-label="Toggle navigation" onClick={() => setOpen(v => !v)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        <nav className={`site-nav ${open ? 'open' : ''}`}>
          {nav.map(([href, label]) => <Link key={href} className={location.pathname === href ? 'active' : ''} to={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link to="/contact" className="nav-cta" onClick={() => setOpen(false)}>Book a Service <ArrowRight size={16} /></Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div><span className="eyebrow">MHR AUTO SERVICES</span><h3>Cars deserve more than guesswork.</h3><p>Independent mechanical care, modern diagnostics and honest advice.</p></div>
        <div className="footer-links"><Link to="/work">Recent work</Link><Link to="/mechanic">Meet the mechanic</Link><Link to="/contact">Contact</Link></div>
        <div className="footer-meta"><span>© 2026 MHR Auto Services</span><span>Built for the road ahead.</span></div>
      </footer>
    </div>
  )
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.65, ease: 'easeOut', delay }}>{children}</motion.div>
}

function Home() {
  return <div>
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
          <span className="eyebrow">DEPENDABLE. PRECISE. INDEPENDENT.</span>
          <h1>Serious about<br /><em>your car.</em></h1>
          <p>Premium servicing, MOT, diagnostics and repairs without the main-dealer attitude.</p>
          <div className="hero-actions"><Link to="/contact" className="button primary">Book a Service <ArrowRight size={18} /></Link><Link to="/work" className="button ghost">See Recent Work</Link></div>
        </motion.div>
        <div className="hero-stats">
          <div><b>10+</b><span>Years experience</span></div><div><b>1:1</b><span>Expert attention</span></div><div><b>5★</b><span>Local reputation</span></div>
        </div>
      </div>
      <a className="scroll-cue" href="#services"><span>Scroll to explore</span><ChevronDown size={18}/></a>
    </section>

    <section className="section section-intro" id="services">
      <Reveal><div className="section-heading"><span className="eyebrow">WHAT WE DO</span><h2>Workshop-quality work,<br /><span>without the theatre.</span></h2><p>Every job starts with proper diagnosis, clear communication and a plan that makes sense for the car — and for you.</p></div></Reveal>
      <div className="service-grid">{services.map(({ icon: Icon, title, text }, i) => <Reveal key={title} delay={i * .08}><article className="service-card"><div className="icon-box"><Icon size={22}/></div><div><span className="service-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></div><ArrowRight className="service-arrow" size={20}/></article></Reveal>)}</div>
    </section>

    <section className="feature-band">
      <div className="feature-photo" />
      <div className="feature-copy"><span className="eyebrow">THE MHR WAY</span><h2>No drama.<br /><span>Just good mechanics.</span></h2><p>From a warning light that won't quit to a car that's due its annual service, we keep things simple: inspect properly, explain clearly, fix correctly.</p><div className="feature-list"><span><CheckCircle2 size={17}/> Honest recommendations</span><span><CheckCircle2 size={17}/> Modern diagnostics</span><span><CheckCircle2 size={17}/> Quality parts & workmanship</span></div><Link to="/mechanic" className="text-link">Meet the mechanic <ArrowRight size={17}/></Link></div>
    </section>

    <section className="section work-preview">
      <Reveal><div className="split-heading"><div><span className="eyebrow">RECENT WORK</span><h2>Cars in.<br /><span>Better cars out.</span></h2></div><Link to="/work" className="button ghost">View full gallery</Link></div></Reveal>
      <div className="work-grid">{jobs.slice(0,3).map((job, i) => <Reveal key={job.title} delay={i * .08}><Link to="/work" className="job-card"><div className="job-image" style={{ backgroundImage: `url(${job.image})` }}><span>{job.tag}</span></div><div className="job-copy"><div><h3>{job.title}</h3><p>{job.vehicle}</p></div><ArrowUpRight size={20}/></div></Link></Reveal>)}</div>
    </section>

    <section className="cta-band"><div><span className="eyebrow">READY WHEN YOU ARE</span><h2>Let's get your car<br /><span>back on form.</span></h2></div><Link to="/contact" className="button primary">Contact MHR <ArrowRight size={18}/></Link></section>
  </div>
}

function Work() {
  const [selected, setSelected] = useState<typeof jobs[number] | null>(null)
  return <section className="section page-section"><div className="page-intro"><span className="eyebrow">RECENT WORK</span><h1>The workshop,<br /><em>in motion.</em></h1><p>A snapshot of the jobs we’re proud to put back on the road.</p></div><div className="gallery-grid">{jobs.map((job, i) => <Reveal key={job.title} delay={i * .06}><button className="gallery-card" onClick={() => setSelected(job)}><div className="gallery-image" style={{ backgroundImage: `url(${job.image})` }}><span>{job.tag}</span></div><div className="gallery-copy"><div><h3>{job.title}</h3><p>{job.vehicle}</p></div><ArrowUpRight size={20}/></div></button></Reveal>)}</div>{selected && <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setSelected(null)}><button className="lightbox-close" onClick={() => setSelected(null)}><X /></button><div className="lightbox-card" onClick={e => e.stopPropagation()}><img src={selected.image} alt={selected.title} /><div><span className="eyebrow">{selected.tag}</span><h2>{selected.title}</h2><p>{selected.vehicle}</p></div></div></div>}</section>
}

function Mechanic() {
  return <section className="section page-section"><div className="mechanic-grid"><div className="mechanic-photo" /><div className="mechanic-copy"><span className="eyebrow">MEET THE MECHANIC</span><h1>Good cars deserve<br /><em>good people.</em></h1><p className="lead">MHR is a small independent garage built around the idea that you should know who is working on your car, what they're doing, and why.</p><p>After years working across everyday cars, performance models and commercial vehicles, the focus is always the same: diagnose properly, repair cleanly, and give customers advice they can actually trust.</p><div className="credential-grid"><div><b>10+</b><span>Years in the trade</span></div><div><b>OE</b><span>Quality components</span></div><div><b>LIVE</b><span>Diagnostic capability</span></div><div><b>1:1</b><span>Personal service</span></div></div><blockquote>“I’d rather explain why you need something than try to sell you something.”</blockquote><Link to="/contact" className="button primary">Talk about your car <ArrowRight size={18}/></Link></div></div></section>
}

function Contact() {
  const [sent, setSent] = useState(false)
  return <section className="section page-section contact-section"><div className="page-intro"><span className="eyebrow">CONTACT MHR</span><h1>Let's talk<br /><em>cars.</em></h1><p>Tell us what you need and we'll come back to you with the next sensible step.</p></div><div className="contact-grid"><div className="contact-details"><div className="detail"><MapPin size={20}/><div><span>Garage</span><strong>Harbour Industrial Estate<br />Your Town, UK</strong></div></div><div className="detail"><Phone size={20}/><div><span>Phone</span><strong>01234 567 890</strong></div></div><div className="detail"><Mail size={20}/><div><span>Email</span><strong>hello@mhrautoservices.co.uk</strong></div></div><div className="detail"><Clock3 size={20}/><div><span>Opening hours</span><strong>Mon–Fri · 08:00–18:00<br />Sat · 09:00–13:00</strong></div></div><div className="socials"><a aria-label="Instagram" href="#"><Instagram size={19}/></a><a aria-label="Email" href="mailto:hello@mhrautoservices.co.uk"><Mail size={19}/></a></div></div><form className="contact-form" onSubmit={e => { e.preventDefault(); setSent(true) }}>{sent ? <div className="success-state"><Sparkles size={30}/><h2>Message received.</h2><p>Thanks — the enquiry form is now wired for the Cloudflare Function mail endpoint.</p><button className="button ghost" type="button" onClick={() => setSent(false)}>Send another</button></div> : <><div className="form-row"><label>Name<input name="name" required placeholder="Your name" /></label><label>Email<input name="email" type="email" required placeholder="you@example.com" /></label></div><label>What do you need?<textarea name="message" required rows={6} placeholder="Tell us about the car, fault, MOT, service or repair…" /></label><button className="button primary" type="submit">Send enquiry <ArrowRight size={18}/></button></>}</form></div><div className="map-placeholder"><div><MapPin size={22}/><strong>Workshop location</strong><span>Embedded map will be connected to your exact garage address in the Cloudflare build.</span></div></div></section>
}

function Admin() {
  return <section className="section page-section admin-page"><div className="admin-card"><span className="eyebrow">PRIVATE AREA</span><h1>Garage admin.</h1><p>Secure login and invoice management are scaffolded here for the Cloudflare Functions stage.</p><div className="admin-features"><span><CheckCircle2 size={17}/> Recent work manager</span><span><CheckCircle2 size={17}/> Invoice generator</span><span><CheckCircle2 size={17}/> PDF preview + email</span></div><div className="admin-note">Admin auth, signed uploads, D1 records and R2 storage are implemented in the next backend milestone.</div></div></section>
}

export default function App() {
  return <Shell><AnimatePresence mode="wait"><Routes><Route path="/" element={<Home />} /><Route path="/work" element={<Work />} /><Route path="/mechanic" element={<Mechanic />} /><Route path="/contact" element={<Contact />} /><Route path="/admin" element={<Admin />} /></Routes></AnimatePresence></Shell>
}
