// tudo aqui roda depois que o html e as libs carregarem, pq o script tá no fim do body

document.addEventListener("DOMContentLoaded", () => {
  // pega os elementos do form
  const form = document.querySelector("#cadastro form");

  const nome  = document.getElementById("nome");
  const cpf   = document.getElementById("cpf");
  const tel   = document.getElementById("telefone");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const s2    = document.getElementById("confirma_senha");

  const cep       = document.getElementById("cep");
  const btnCep    = document.getElementById("btn-cep");
  const endereco  = document.getElementById("endereco");
  const numero    = document.getElementById("numero");
  const cidade    = document.getElementById("cidade");
  const estado    = document.getElementById("estado");

  const eNome  = document.getElementById("erro-nome");
  const eCPF   = document.getElementById("erro-cpf");
  const eGen   = document.getElementById("erro-genero");
  const eTel   = document.getElementById("erro-telefone");
  const eEmail = document.getElementById("erro-email");
  const eSenha = document.getElementById("erro-senha");
  const eS2    = document.getElementById("erro-confirma-senha");
  const eCEP   = document.getElementById("erro-cep");
  const eEnd   = document.getElementById("erro-endereco");
  const eNum   = document.getElementById("erro-numero");
  const eCid   = document.getElementById("erro-cidade");
  const eUF    = document.getElementById("erro-estado");

  const telDDI = document.getElementById("tel_ddi");
  const telNat = document.getElementById("tel_nacional");
  const telE164= document.getElementById("tel_e164");

  // segurança: garante que a lib do telefone existe
  if (!window.intlTelInput) {
    console.error("intl-tel-input não carregou. confere as <script> no html.");
    eTel.textContent = "falhou carregar o seletor de ddi";
    tel.classList.add("input-erro");
    return;
  }

  // inicia o dropdown de ddi. deixo sem país inicial pra obrigar a escolher antes de digitar
  const iti = window.intlTelInput(tel, {
    initialCountry: "",
    separateDialCode: true,
    nationalMode: false,
    autoPlaceholder: "off",
    formatOnDisplay: true,
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.8/build/js/utils.js"
  });

  // trava digitar até escolher o ddi
  let ddiEscolhido = false;
  tel.addEventListener("keydown", (ev) => {
    if (!ddiEscolhido) {
      ev.preventDefault();
      eTel.textContent = "escolhe o ddi no dropdown primeiro :)";
      tel.classList.add("input-erro");
    }
  });
  tel.addEventListener("paste", (ev) => {
    if (!ddiEscolhido) ev.preventDefault(); // sem colar antes do ddi
  });

  // quando escolher o país, libera digitação e salva o ddi no hidden
  tel.addEventListener("countrychange", () => {
    ddiEscolhido = true;
    tel.classList.remove("input-erro");
    eTel.textContent = "";
    tel.value = "";
    const data = iti.getSelectedCountryData();
    telDDI.value = data?.dialCode ? "+" + data.dialCode : "";
  });

  // valida enquanto digita
  nome.addEventListener("input", () => {
    nome.value = nome.value.replace(/\s{2,}/g, " ");
    validaNome();
  });

  // cpf: formata 000.000.000-00 e valida
  cpf.addEventListener("input", () => {
    const nums = cpf.value.replace(/\D/g, "").slice(0, 11);
    let m = nums;
    if (nums.length > 9)  m = nums.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
    else if (nums.length > 6) m = nums.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
    else if (nums.length > 3) m = nums.replace(/(\d{3})(\d{0,3})/, "$1.$2");
    cpf.value = m;
    validaCPF();
  });

  tel.addEventListener("input", () => validaTelefone());
  email.addEventListener("input", () => validaEmail());
  senha.addEventListener("input", () => validaSenha());
  s2.addEventListener("input", () => validaConfirmacao());

  // cep: mascara 00000-000
  cep.addEventListener("input", () => {
    const nums = cep.value.replace(/\D/g, "").slice(0, 8);
    cep.value = nums.length > 5 ? nums.replace(/(\d{5})(\d{0,3})/, "$1-$2") : nums;
    eCEP.textContent = "";
    cep.classList.remove("input-erro");
  });

  // botão ok do cep: consulta viacep
  btnCep.addEventListener("click", async () => {
    const puro = cep.value.replace(/\D/g, "");
    if (puro.length !== 8) {
      eCEP.textContent = "cep tem 8 dígitos (ex: 01001-000)";
      cep.classList.add("input-erro");
      return;
    }
    btnCep.disabled = true;
    eCEP.textContent = "consultando...";
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${puro}/json/`);
      const data = await resp.json();
      if (data.erro) throw new Error("cep não encontrado");
      endereco.value = (data.logradouro || "").trim();
      cidade.value   = (data.localidade || "").trim();
      estado.value   = (data.uf || "").trim();
      numero.disabled = false;
      eCEP.textContent = "";
      [endereco, cidade, estado].forEach(i => i.classList.remove("input-erro"));
      numero.focus();
    } catch (err) {
      eCEP.textContent = "não rolou achar esse cep :/";
      [endereco, cidade, estado].forEach(i => { i.value = ""; i.classList.add("input-erro"); });
    } finally {
      btnCep.disabled = false;
    }
  });

  // helpers de validação (bem diretos)
  function marcaErro(el, span, msg) {
    span.textContent = msg || "";
    if (msg) el.classList.add("input-erro"); else el.classList.remove("input-erro");
  }

  function validaNome() {
    const letras = (nome.value.match(/[a-záàâãéèêíïóôõöúçñ]/gi) || []).length;
    if (letras < 3) { marcaErro(nome, eNome, "coloca pelo menos 3 letras"); return false; }
    marcaErro(nome, eNome, "");
    return true;
  }

  function validaCPF() {
    const nums = cpf.value.replace(/\D/g, "");
    if (nums.length !== 11) { marcaErro(cpf, eCPF, "cpf tem 11 dígitos"); return false; }
    if (/(^(\d)\1{10}$)/.test(nums)) { marcaErro(cpf, eCPF, "cpf inválido"); return false; }
    const dig = (base) => {
      let soma = 0;
      for (let i = 0; i < base.length; i++) soma += parseInt(base[i], 10) * (base.length + 1 - i);
      const r = (soma * 10) % 11;
      return (r === 10) ? 0 : r;
    };
    const d1 = dig(nums.slice(0, 9));
    const d2 = dig(nums.slice(0, 10));
    const ok = d1 === parseInt(nums[9], 10) && d2 === parseInt(nums[10], 10);
    if (!ok) { marcaErro(cpf, eCPF, "cpf inválido"); return false; }
    marcaErro(cpf, eCPF, "");
    return true;
  }

  function validaGenero() {
    const marcado = form.querySelector('input[name="genero"]:checked');
    if (!marcado) { eGen.textContent = "escolhe uma opção"; return false; }
    eGen.textContent = "";
    return true;
  }

  function validaTelefone() {
    if (!ddiEscolhido) { marcaErro(tel, eTel, "escolhe o ddi no dropdown"); return false; }
    const raw = tel.value.replace(/\D/g, "");
    if (raw.length < 6) { marcaErro(tel, eTel, "número muito curto"); return false; }
    const data = iti.getSelectedCountryData();
    const ddi = data?.dialCode ? "+" + data.dialCode : "";
    telDDI.value  = ddi;
    telNat.value  = tel.value.trim();
    telE164.value = ddi + raw;
    marcaErro(tel, eTel, "");
    return true;
  }

  function validaEmail() {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!ok) { marcaErro(email, eEmail, "email meio estranho, confere aí"); return false; }
    marcaErro(email, eEmail, "");
    return true;
  }

  function validaSenha() {
    const v = senha.value;
    const ok = /[A-Za-z]/.test(v) && /\d/.test(v) && v.length >= 8;
    if (!ok) { marcaErro(senha, eSenha, "mín 8, com letras e números"); return false; }
    marcaErro(senha, eSenha, "");
    if (s2.value) validaConfirmacao();
    return true;
  }

  function validaConfirmacao() {
    if (s2.value !== senha.value || !s2.value) { marcaErro(s2, eS2, "as senhas não batem"); return false; }
    marcaErro(s2, eS2, "");
    return true;
  }

  function validaCEPPreenchido() {
    let ok = true;
    if (!endereco.value.trim()) { marcaErro(endereco, eEnd, "preenche pelo cep"); ok = false; } else marcaErro(endereco, eEnd, "");
    if (!cidade.value.trim())   { marcaErro(cidade,   eCid, "preenche pelo cep"); ok = false; } else marcaErro(cidade,   eCid, "");
    if (!estado.value.trim())   { marcaErro(estado,   eUF,  "preenche pelo cep"); ok = false; } else marcaErro(estado,   eUF,  "");
    if (numero.disabled || !numero.value.trim()) { marcaErro(numero, eNum, "informa o número"); ok = false; } else marcaErro(numero, eNum, "");
    return ok;
  }

  // valida tudo no submit e mostra tudo de uma vez
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const okNome  = validaNome();
    const okCPF   = validaCPF();
    const okGen   = validaGenero();
    const okTel   = validaTelefone();
    const okEmail = validaEmail();
    const okSenha = validaSenha();
    const okS2    = validaConfirmacao();
    const okCEP   = validaCEPPreenchido();

    const tudoOk = okNome && okCPF && okGen && okTel && okEmail && okSenha && okS2 && okCEP;

    if (tudoOk) {
      alert("form válido! (aqui você enviaria pro backend)");
      // form.submit(); // se quiser mandar de verdade
    } else {
      const primeiroErro = form.querySelector(".input-erro") || form.querySelector(".erro:not(:empty)");
      if (primeiroErro) {
        primeiroErro.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });
});
