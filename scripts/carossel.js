
const slides = document.querySelectorAll(".carrossel > div");
const dots   = document.querySelectorAll(".dots input[type='radio']");


let index = 0;


function acharIndiceInicial() {
  const iDot = Array.from(dots).findIndex(d => d.checked);
  if (iDot >= 0) return Math.min(iDot, slides.length - 1);

  const iSlideAtivo = Array.from(slides).findIndex(s => s.classList.contains("slideAtivo"));
  return iSlideAtivo >= 0 ? iSlideAtivo : 0;
}


function aplicarEstado() {
 
  slides.forEach(s => {
    s.classList.remove("ativo");
    s.classList.remove("slideAtivo"); 
  });

 
  if (slides[index]) slides[index].classList.add("ativo");


  if (dots[index]) dots[index].checked = true;
}

function setAtivo(n) {
  const max = slides.length;
  index = ((n % max) + max) % max; 
  aplicarEstado();
}


function init() {

  dots.forEach((d, i) => {
    d.type = "radio";
    d.name = "carrossel-dots";
    d.setAttribute("aria-label", `Ir para slide ${i + 1}`);
  });


  index = acharIndiceInicial();

 
  if (!Array.from(dots).some(d => d.checked) && dots[index]) {
    dots[index].checked = true;
  }

  aplicarEstado();
}


dots.forEach((dot, i) => {
  dot.addEventListener("change", () => {
    if (i < slides.length) setAtivo(i);
    else dot.checked = false; 
  });
});

const btnPrev = document.querySelector(".anterior");
const btnNext = document.querySelector(".proximo");

btnPrev?.addEventListener("click", () => setAtivo(index - 1));
btnNext?.addEventListener("click", () => setAtivo(index + 1));

init();