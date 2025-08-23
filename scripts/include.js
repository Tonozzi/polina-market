
document.addEventListener("DOMContentLoaded", () => {
  const repoRoot = new URL('..', document.currentScript.src); 

  const headerURL = new URL('partials/header.html', repoRoot);
  const footerURL = new URL('partials/footer.html', repoRoot);


  fetch(headerURL).then(r => r.text()).then(html => {
    const slot = document.querySelector('#header');
    if (slot) slot.innerHTML = html;
  });

  fetch(footerURL).then(r => r.text()).then(html => {
    const slot = document.querySelector('#footer');
    if (slot) slot.innerHTML = html;
  });
});
