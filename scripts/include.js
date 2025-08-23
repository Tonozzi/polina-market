document.addEventListener('DOMContentLoaded', () => {

  const headerURL = 'partials/header.html';
  const footerURL = 'partials/footer.html';


  fetch(headerURL)
    .then(res => res.text())
    .then(html => {
      const headerSlot = document.querySelector('#header');
      if (headerSlot) headerSlot.innerHTML = html;
    });

  fetch(footerURL)
    .then(res => res.text())
    .then(html => {
      const footerSlot = document.querySelector('#footer');
      if (footerSlot) footerSlot.innerHTML = html;
    });
});