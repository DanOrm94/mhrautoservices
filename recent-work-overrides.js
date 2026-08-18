(() => {
  const images = ['/mhr1.png', '/mhr2.png', '/mhr3.png'];

  function applyRecentWorkImages() {
    const cards = document.querySelectorAll('.gallery-grid .gallery-card');
    cards.forEach((card, index) => {
      const image = card.querySelector('.gallery-image');
      const label = image?.querySelector('span');
      if (!image || index >= images.length) return;
      image.style.backgroundImage = `url("${images[index]}")`;
      if (label) label.style.display = 'none';
    });
  }

  const observer = new MutationObserver(applyRecentWorkImages);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  applyRecentWorkImages();
})();
