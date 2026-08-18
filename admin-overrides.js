(() => {
  function removeAddJobPanel() {
    if (window.location.pathname !== '/admin') return

    const panels = document.querySelectorAll('.dashboard-grid > .panel')
    if (!panels.length) return

    const addJobPanel = [...panels].find(panel => {
      const heading = panel.querySelector('h2')?.textContent?.trim().toLowerCase()
      return heading === 'add a job'
    })

    if (addJobPanel) addJobPanel.remove()

    const grid = document.querySelector('.dashboard-grid')
    if (grid) grid.classList.add('single-panel')
  }

  const style = document.createElement('style')
  style.textContent = `
    .dashboard-grid.single-panel { grid-template-columns: minmax(0, 1fr); }
    .dashboard-grid.single-panel > .panel { width: 100%; }
  `
  document.head.appendChild(style)

  const observer = new MutationObserver(removeAddJobPanel)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  removeAddJobPanel()
})()
