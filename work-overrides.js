const WORK_IMAGES = ['/mhr1.png', '/mhr2.png', '/mhr3.png']

function setupRecentWorkSlideshow() {
  if (window.location.pathname !== '/work') return
  const gallery = document.querySelector('.gallery-grid')
  if (!gallery || gallery.dataset.mhrSlideshow === '1') return

  gallery.dataset.mhrSlideshow = '1'
  gallery.className = 'mhr-work-slideshow'
  gallery.innerHTML = `
    <div class="mhr-slide-stage">
      ${WORK_IMAGES.map((src, i) => `<img class="mhr-slide ${i === 0 ? 'active' : ''}" src="${src}" alt="MHR Auto Services recent work ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}">`).join('')}
      <button class="mhr-slide-arrow mhr-prev" type="button" aria-label="Previous image">‹</button>
      <button class="mhr-slide-arrow mhr-next" type="button" aria-label="Next image">›</button>
      <div class="mhr-slide-counter"><span class="mhr-current">01</span><span class="mhr-divider">/</span><span>03</span></div>
    </div>
    <div class="mhr-slide-footer">
      <div><span class="eyebrow">MHR AUTO SERVICES</span><h2>Recent work.<br><em>Done properly.</em></h2></div>
      <div class="mhr-dots" aria-label="Choose image">
        ${WORK_IMAGES.map((_, i) => `<button type="button" class="mhr-dot ${i === 0 ? 'active' : ''}" aria-label="Show image ${i + 1}"></button>`).join('')}
      </div>
      <span class="mhr-slide-hint">Use the arrows to explore</span>
    </div>`

  const slides = [...gallery.querySelectorAll('.mhr-slide')]
  const dots = [...gallery.querySelectorAll('.mhr-dot')]
  const current = gallery.querySelector('.mhr-current')
  let index = 0
  let timer

  const show = (next) => {
    index = (next + slides.length) % slides.length
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index))
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index))
    current.textContent = String(index + 1).padStart(2, '0')
  }
  const restart = () => { clearInterval(timer); timer = setInterval(() => show(index + 1), 5000) }

  gallery.querySelector('.mhr-prev').addEventListener('click', () => { show(index - 1); restart() })
  gallery.querySelector('.mhr-next').addEventListener('click', () => { show(index + 1); restart() })
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); restart() }))
  gallery.addEventListener('mouseenter', () => clearInterval(timer))
  gallery.addEventListener('mouseleave', restart)
  restart()
}

const style = document.createElement('style')
style.textContent = `
.mhr-work-slideshow{margin-top:48px!important;display:block!important}
.mhr-slide-stage{position:relative;width:100%;height:min(68vh,700px);min-height:420px;overflow:hidden;background:#0b0d10;border:1px solid rgba(255,255,255,.09);box-shadow:0 28px 80px rgba(0,0,0,.28)}
.mhr-slide{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.035);transition:opacity .7s ease,transform 5.2s ease;pointer-events:none}
.mhr-slide.active{opacity:1;transform:scale(1)}
.mhr-slide-stage:after{content:"";position:absolute;inset:45% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.62));pointer-events:none}
.mhr-slide-arrow{position:absolute;z-index:3;top:50%;transform:translateY(-50%);width:52px;height:52px;border:1px solid rgba(255,255,255,.28);background:rgba(8,10,13,.58);backdrop-filter:blur(8px);color:#fff;font:300 38px/1 Arial;cursor:pointer;transition:.2s}
.mhr-slide-arrow:hover{background:var(--accent);border-color:var(--accent);color:#120a06}
.mhr-prev{left:24px}.mhr-next{right:24px}
.mhr-slide-counter{position:absolute;z-index:4;right:28px;bottom:24px;color:#fff;font:700 12px var(--sans);letter-spacing:.14em}.mhr-divider{margin:0 8px;color:rgba(255,255,255,.45)}
.mhr-slide-footer{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:end;padding:34px 4px 0}.mhr-slide-footer h2{font:700 clamp(38px,5vw,62px)/.92 var(--serif);margin:12px 0 0;letter-spacing:-.025em}.mhr-slide-footer h2 em{color:#7e828a;font-style:normal}.mhr-dots{display:flex;gap:9px;align-items:center;padding-bottom:7px}.mhr-dot{width:42px;height:3px;border:0;background:#363a40;cursor:pointer;padding:0;transition:.25s}.mhr-dot.active{background:var(--accent);width:68px}.mhr-slide-hint{grid-column:2;text-align:right;color:#747a84;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
@media(max-width:720px){.mhr-work-slideshow{margin-top:34px!important}.mhr-slide-stage{height:62vh;min-height:330px}.mhr-slide-arrow{width:44px;height:44px;font-size:30px}.mhr-prev{left:14px}.mhr-next{right:14px}.mhr-slide-counter{right:18px;bottom:17px}.mhr-slide-footer{grid-template-columns:1fr;padding-top:26px}.mhr-slide-footer h2{font-size:42px}.mhr-dots{padding:0}.mhr-slide-hint{grid-column:1;text-align:left}.mhr-dot{width:28px}.mhr-dot.active{width:48px}}
`
document.head.appendChild(style)

const observer = new MutationObserver(setupRecentWorkSlideshow)
observer.observe(document.documentElement, { childList: true, subtree: true })
setupRecentWorkSlideshow()
