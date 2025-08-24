document.addEventListener('DOMContentLoaded', function () {
  var botoes = document.querySelectorAll('.cat');
  var paineis = document.querySelectorAll('.panel');

  function mostrar(id) {
    if (!id) return;
    
    for (var i = 0; i < botoes.length; i++) {
      var b = botoes[i];
      b.classList.remove('ativo');
    }
    for (var j = 0; j < paineis.length; j++) {
      var p = paineis[j];
      p.classList.remove('ativo');
    }
    
    var btn = document.querySelector('.cat[data-target="' + id + '"]');
    var painel = document.getElementById(id);
    if (btn) btn.classList.add('ativo');
    if (painel) painel.classList.add('ativo');
  }

  
  for (var i = 0; i < botoes.length; i++) {
    botoes[i].addEventListener('click', function () {
      var id = this.getAttribute('data-target');
      location.hash = '#' + id;   
      mostrar(id);
    });
  }

 
  var inicial = location.hash ? location.hash.slice(1) : null;
  if (inicial) {
    mostrar(inicial);
  } else {
    
    var btnAtivo = document.querySelector('.cat.ativo');
    if (btnAtivo) mostrar(btnAtivo.getAttribute('data-target'));
  }

  
  window.addEventListener('hashchange', function () {
    var id = location.hash.slice(1);
    mostrar(id);
  });
});
