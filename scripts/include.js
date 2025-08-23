document.addEventListener("DOMContentLoaded", () => {
  
  fetch("../partials/header.html")
    .then(res => res.text())
    .then(html => {
      document.querySelector("#header").innerHTML = html;
    });


  fetch("../partials/header.html")
    .then(res => res.text())
    .then(html => {
      document.querySelector("#footer").innerHTML = html;
    });
});