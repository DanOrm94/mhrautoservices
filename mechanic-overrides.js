(() => {
  const bio = `Andrew Ormrod has worked with cars since leaving school, building his experience from the ground up. He began his career as an apprentice at Honda, where he developed a strong foundation in vehicle servicing, diagnostics and repairs. Over the years, Andrew has continued to expand his knowledge across a wide range of makes and models, gaining the practical experience and attention to detail that comes from years spent working hands-on with vehicles. Today, Andrew brings that experience to MHR Auto Services, providing honest, dependable and professional work with a straightforward approach to keeping your car safe and running properly.`;

  function apply() {
    if (window.location.pathname !== '/mechanic') return;
    const copy = document.querySelector('.mechanic-copy');
    if (!copy || copy.dataset.andrewBio === '1') return;
    const paragraphs = copy.querySelectorAll('p');
    if (paragraphs.length < 2) return;
    paragraphs[1].textContent = bio;
    copy.dataset.andrewBio = '1';
  }

  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  apply();
})();
