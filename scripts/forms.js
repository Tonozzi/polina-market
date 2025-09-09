console.log("teste");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#cadastro form");
  if (!form) return;

  // pegae campos
  const nome   = form.querySelector("#nome");
  const cpf    = form.querySelector("#cpf");
  const tel    = form.querySelector("#telefone");
  const email  = form.querySelector("#emailCadastro");
  const senha  = form.querySelector("#senhaCadastro");
  const s2     = form.querySelector("#confirma_senha");

  const generoRadios = form.querySelectorAll('input[name="genero"]');

  const cep      = form.querySelector("#cep");
  const btnCep   = form.querySelector("#btn-cep");
  const endereco = form.querySelector("#endereco");
  const numero   = form.querySelector("#numero");
  const cidade   = form.querySelector("#cidade");
  const estado   = form.querySelector("#estado");

  // spans de erro
  const eNome   = form.querySelector("#erro-nome");
  const eCPF    = form.querySelector("#erro-cpf");
  const eTel    = form.querySelector("#erro-telefone");
  const eEmail  = form.querySelector("#erro-email");
  const eSenha  = form.querySelector("#erro-senha");
  const eS2     = form.querySelector("#erro-confirma-senha");
  const eGen    = form.querySelector("#erro-genero");
  const eCEP    = form.querySelector("#erro-cep");
  const eEnd    = form.querySelector("#erro-endereco");
  const eNum    = form.querySelector("#erro-numero");
  const eCid    = form.querySelector("#erro-cidade");
  const eUF     = form.querySelector("#erro-estado");

  // campos ocultos do telefone 
  const telDDI  = form.querySelector("#tel_ddi");
  const telNat  = form.querySelector("#tel_nacional");
  const telE164 = form.querySelector("#tel_e164");

  // helpers
  const setErr = (el, span, msg) => {
    if (el) el.classList.toggle("input-erro", !!msg);
    if (span) span.textContent = msg || "";
    return !msg;
  };
  const clearErr = (el, span) => setErr(el, span, "");

  const soDigitos = (v) => (v || "").replace(/\D/g, "");

  let cepOk = false; // só fica true após viacep validar

  const lockAddress = (lock) => {
    [endereco, numero, cidade, estado].forEach((el) => {
      if (!el) return;
      el.readOnly = !!lock;
      el.classList.toggle("bloqueado", !!lock);
      if (lock) {
        if (el === endereco) clearErr(endereco, eEnd);
        if (el === numero)   clearErr(numero,   eNum);
        if (el === cidade)   clearErr(cidade,   eCid);
        if (el === estado)   clearErr(estado,   eUF);
      }
    });
  };

  // bloqueio de campos até que o CEP seja inserido e validado
  lockAddress(true);

  // validações
  const validaNome = () => {
    const v = (nome?.value || "").trim();
    if (!v) return setErr(nome, eNome, "Informe seu nome.");
    if (v.length < 2) return setErr(nome, eNome, "Nome muito curto.");
    return setErr(nome, eNome, "");
  };

  const cpfValido = (str) => {
    const v = soDigitos(str);
    if (v.length !== 11 || /^(\d)\1{10}$/.test(v)) return false;
    const calc = (base) => {
      let soma = 0;
      for (let i = 0; i < base; i++) soma += parseInt(v[i]) * (base + 1 - i);
      let d = 11 - (soma % 11);
      return d >= 10 ? 0 : d;
    };
    const d1 = calc(9);
    const d2 = calc(10);
    return d1 === parseInt(v[9]) && d2 === parseInt(v[10]);
  };

  const formataCPF = (str) => {
    const v = soDigitos(str).slice(0, 11);
    return v
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  };

  const validaCPF = () => {
    if (!cpf) return true;
    const raw = cpf.value;
    if (!raw) return setErr(cpf, eCPF, "Informe o CPF.");
    if (!cpfValido(raw)) return setErr(cpf, eCPF, "CPF inválido.");
    return setErr(cpf, eCPF, "");
  };

  const validaGenero = () => {
    const marcado = Array.from(generoRadios).some((r) => r.checked);
    return setErr(null, eGen, marcado ? "" : "Selecione uma opção.");
  };

  // telefone usando a lib "tel input" para inserir ddi internacionais
  let iti = null;
  if (tel && window.intlTelInput) {
    try {
      iti = window.intlTelInput(tel, {
        initialCountry: "br",
        separateDialCode: true,
        nationalMode: true,
        autoPlaceholder: "aggressive",
        preferredCountries: ["br","us","pt","ar"],
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.8/build/js/utils.js"
      });
    } catch (err) {
      console.error("Falha ao iniciar intl-tel-input:", err);
    }
  }

  const onlyDigitKey = (ev) => {
    const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","Tab","Escape","Enter"];
    const combo = ev.ctrlKey || ev.metaKey;
    if (allowed.includes(ev.key) || combo) return;
    if (!/^\d$/.test(ev.key)) ev.preventDefault();
  };

  const sanitizePaste = (ev) => {
    ev.preventDefault();
    const txt = (ev.clipboardData || window.clipboardData).getData("text") || "";
    const digits = txt.replace(/\D/g, "");
    const start = tel.selectionStart ?? tel.value.length;
    const end   = tel.selectionEnd   ?? tel.value.length;
    const before = tel.value.slice(0, start).replace(/\D/g, "");
    const after  = tel.value.slice(end).replace(/\D/g, "");
    tel.value = before + digits + after;
    formatNational();
  };

  const atualizaHiddenTelefone = () => {
    if (!tel) return;
    const numero = tel.value || "";
    if (telNat) telNat.value = numero;
    if (iti) {
      const data = iti.getSelectedCountryData?.() || {};
      if (telDDI) telDDI.value = data.dialCode || "";
      if (telE164) {
        telE164.value = (window.intlTelInputUtils && iti.getNumber)
          ? iti.getNumber(window.intlTelInputUtils.numberFormat.E164)
          : "";
      }
    } else {
      if (telDDI) telDDI.value = "";
      if (telE164) telE164.value = "";
    }
  };

  const formatNational = () => {
    if (!iti) return;
    const nationalDigits = (tel.value || "").replace(/\D/g, "");
    if (!nationalDigits) { tel.value = ""; return; }
    const data = iti.getSelectedCountryData?.() || {};
    const dial = data.dialCode || "";
    if (window.intlTelInputUtils && typeof window.intlTelInputUtils.formatNumber === "function") {
      const rawPlus = `+${dial}${nationalDigits}`;
      const formatted = window.intlTelInputUtils.formatNumber(
        rawPlus,
        data.iso2,
        window.intlTelInputUtils.numberFormat.NATIONAL
      );
      tel.value = formatted || nationalDigits;
    } else {
      tel.value = nationalDigits;
    }
    atualizaHiddenTelefone();
  };

  const validaTelefone = () => {
    if (!tel) return true;
    atualizaHiddenTelefone();

    const digits = (tel.value || "").replace(/\D/g, "");
    if (!digits) return setErr(tel, eTel, "");

    if (iti && window.intlTelInputUtils && typeof iti.isValidNumber === "function") {
      return setErr(tel, eTel, iti.isValidNumber() ? "" : "Telefone inválido.");
    }
    return setErr(tel, eTel, digits.length >= 8 ? "" : "Telefone inválido.");
  };

  // email e senha
  const validaEmail = () => {
    if (!email) return true;
    const v = (email.value || "").trim();
    if (!v) return setErr(email, eEmail, "Informe o e-mail.");
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    return setErr(email, eEmail, ok ? "" : "E-mail inválido.");
  };

  const validaSenha = () => {
    if (!senha) return true;
    const v = senha.value || "";
    if (!v) return setErr(senha, eSenha, "Informe a senha.");
    if (v.length < 6) return setErr(senha, eSenha, "Mínimo 6 caracteres.");
    return setErr(senha, eSenha, "");
  };

  const validaConfirmacao = () => {
    if (!s2 || !senha) return true;
    const v = s2.value || "";
    if (!v) return setErr(s2, eS2, "Confirme sua senha.");
    if (v !== senha.value) return setErr(s2, eS2, "As senhas não coincidem.");
    return setErr(s2, eS2, "");
  };

  // FORMATACAO DO CEP
  const formataCEP = (v) =>
    soDigitos(v).slice(0, 8).replace(/^(\d{5})(\d{0,3})$/, "$1-$2");

  const validaCEP = () => {
    if (!cep) return true;
    const dig = soDigitos(cep.value);
    if (dig.length !== 8) return setErr(cep, eCEP, "CEP inválido.");
    return setErr(cep, eCEP, "");
  };

  const preencheEndereco = (data) => {
    if (endereco) endereco.value = data.logradouro || "";
    if (cidade)   cidade.value   = data.localidade || "";
    if (estado)   estado.value   = data.uf || "";
    clearErr(endereco, eEnd);
    clearErr(cidade,   eCid);
    clearErr(estado,   eUF);
  };

  const buscarCEP = async () => {
    if (!cep) return;
    const dig = soDigitos(cep.value);
    cepOk = false;

    if (dig.length !== 8) {
      setErr(cep, eCEP, "CEP inválido.");
      lockAddress(true);
      return;
    }
    try {
      clearErr(cep, eCEP);
      const resp = await fetch(`https://viacep.com.br/ws/${dig}/json/`);
      const data = await resp.json();
      if (data.erro) {
        setErr(cep, eCEP, "CEP incorreto ou não encontrado.");
        lockAddress(true);
        return;
      }
      preencheEndereco(data);
      lockAddress(false);
      cepOk = true;
      numero?.focus();
    } catch (e) {
      setErr(cep, eCEP, "Falha ao buscar CEP.");
      lockAddress(true);
      console.error(e);
    }
  };

  // mantém o cursor
  cpf?.addEventListener("input", () => {
    const raw = cpf.value;
    const caret = cpf.selectionStart ?? raw.length;
    const digitosAntes = (raw.slice(0, caret).match(/\d/g) || []).length;

    const formatado = formataCPF(raw);
    cpf.value = formatado;

    let count = 0, newPos = formatado.length;
    for (let i = 0; i < formatado.length; i++) {
      if (/\d/.test(formatado[i])) {
        count++;
        if (count === digitosAntes) { newPos = i + 1; break; }
      }
    }
    try { cpf.setSelectionRange(newPos, newPos); } catch(_) {}
    validaCPF();
  });

  cep?.addEventListener("input", () => {
    const pos = cep.selectionStart;
    cep.value = formataCEP(cep.value);
    validaCEP();
    try { cep.setSelectionRange(pos, pos); } catch(_) {}
  });

  // enter no CEP dispara busca
  cep?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarCEP();
    }
  });

  btnCep?.addEventListener("click", (e) => {
    e.preventDefault();
    buscarCEP();
  });

  // Telefone
  tel?.addEventListener("keydown", onlyDigitKey);
  tel?.addEventListener("paste", sanitizePaste);
  tel?.addEventListener("input", () => {
    formatNational();
    validaTelefone();
  });
  tel?.addEventListener("countrychange", () => {
    formatNational();
    validaTelefone();
  });

  // blur para mostrar obrigatoriedade
  nome?.addEventListener("blur", validaNome);
  email?.addEventListener("blur", validaEmail);
  senha?.addEventListener("blur", validaSenha);
  s2?.addEventListener("blur", validaConfirmacao);
  generoRadios.forEach((r) => r.addEventListener("change", validaGenero));

  // submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const ok =
      validaNome() &
      validaCPF() &
      validaGenero() &
      validaTelefone() &
      validaEmail() &
      validaSenha() &
      validaConfirmacao() &
      validaCEP();

    if (!cepOk) {
      setErr(cep, eCEP, "Confirme o CEP para preencher o endereço.");
      lockAddress(true);
    }

    const okEnd   = (!endereco || endereco.readOnly) ? true : setErr(endereco, eEnd, (endereco.value || "").trim() ? "" : "Obrigatório.");
    const okNum   = (!numero   || numero.readOnly)   ? true : setErr(numero,   eNum, (numero.value   || "").trim() ? "" : "Obrigatório.");
    const okCid   = (!cidade   || cidade.readOnly)   ? true : setErr(cidade,   eCid, (cidade.value   || "").trim() ? "" : "Obrigatório.");
    const okEstado= (!estado   || estado.readOnly)   ? true : setErr(estado,   eUF,  (estado.value   || "").trim() ? "" : "Obrigatório.");

    const tudoOk = !!(ok & (cepOk ? (okEnd & okNum & okCid & okEstado) : 1));

    if (tudoOk && cepOk) {
      alert("Cadastro enviado!");
      // form.submit();
    } else {
      const primeiroErro =
        form.querySelector(".input-erro") ||
        form.querySelector(".erro:not(:empty)");
      if (primeiroErro) {
        (primeiroErro.scrollIntoView ? primeiroErro : form)
          .scrollIntoView?.({ behavior: "smooth", block: "center" });
      }
    }
  });

  const modalContainer = document.querySelector(".containerModais");
  const closeBtn = document.querySelector(".close");

  closeBtn?.addEventListener("click", () => {
    modalContainer.style.display = "none";
  });

  modalContainer?.addEventListener("click", (e) => {
    if (e.target === modalContainer) {
      modalContainer.style.display = "none";
    }
  });

  const cadastroBox = document.querySelector("#cadastro");
  const loginBox = document.querySelector("#login");
  const tabs = Array.from(document.querySelectorAll(".tab"));

  const cadastroNav = document.querySelector("#cadastroNav");
  const loginNav = document.querySelector("#loginNav");

  function showModal() {
    modalContainer.style.display = "flex";
    document.body.classList.add("modal-open");
  }
  function hideModal() {
    modalContainer.style.display = "none";
    document.body.classList.remove("modal-open");
  }

  function showTab(targetId) {
    const isCadastro = targetId === "cadastro";
    cadastroBox.hidden = !isCadastro;
    loginBox.hidden = isCadastro;

    tabs.forEach(btn => {
      const active = btn.dataset.target === targetId;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
      if (active) btn.focus({ preventScroll: true });
    });
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => showTab(btn.dataset.target));
  });

  document.querySelector(".tabs")?.addEventListener("keydown", (e) => {
    if (!["ArrowLeft","ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const idx = tabs.findIndex(b => b.classList.contains("active"));
    const next = e.key === "ArrowRight" ? (idx+1)%tabs.length : (idx-1+tabs.length)%tabs.length;
    tabs[next].click();
  });

  if (cadastroNav) {
    cadastroNav.addEventListener("click", (e) => {
      e.preventDefault();
      showModal();
      showTab("cadastro");
    });
  }
  if (loginNav) {
    loginNav.addEventListener("click", (e) => {
      e.preventDefault();
      showModal();
      showTab("login");
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", hideModal);
  modalContainer?.addEventListener("click", (e) => {
    if (e.target === modalContainer) hideModal();
  });

  if (location.hash === "#login" || location.hash === "#cadastro") {
    showModal();
    showTab(location.hash.replace("#",""));
  }

  function adjustModalHeight() {
    const modal = document.querySelector(".modal");
    const cadastro = document.querySelector("#cadastro");
    const login = document.querySelector("#login");
    if (!modal || !cadastro || !login) return;
    const maxHeight = Math.max(cadastro.scrollHeight, login.scrollHeight);
    modal.style.minHeight = maxHeight + "px";
  }

  adjustModalHeight();
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", adjustModalHeight);
  });

  // validação de cmapos da área de login
  (function setupLoginEmailValidation() {
    const loginRoot = document.querySelector("#login") || document;
    const fLogin = loginRoot.querySelector("form");
    if (!fLogin) return;

    const emailLogin =
      fLogin.querySelector("#emailLogin") ||
      fLogin.querySelector('input[type="email"]');

    if (!emailLogin) return;

    let eLoginEmail = fLogin.querySelector("#erro-login-email");
    if (!eLoginEmail) {
      eLoginEmail = document.createElement("span");
      eLoginEmail.className = "erro";
      eLoginEmail.id = "erro-login-email";
      emailLogin.insertAdjacentElement("afterend", eLoginEmail);
    }

    const validaEmailLogin = () => {
      const v = (emailLogin.value || "").trim();
      if (!v) return setErr(emailLogin, eLoginEmail, "Informe o e-mail.");
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      return setErr(emailLogin, eLoginEmail, ok ? "" : "E-mail inválido.");
    };

    emailLogin.addEventListener("blur", validaEmailLogin);
    fLogin.addEventListener("submit", (e) => {
      const ok = validaEmailLogin();
      if (!ok) {
        e.preventDefault();
        emailLogin.focus();
      }
    });
  })();

  //agendamento e bloqueio do calendário para datas do passado.
  (function () {
    const btnAgendar = document.querySelector("#btnAgendarRetirada");
    const containerAgendar = document.querySelector(".containerAgendar");
    const modalAgendar = containerAgendar?.querySelector(".modal");
    const closeAgendar = containerAgendar?.querySelector(".close");

    const f = document.querySelector("#formAgendar");
    const nome  = f?.querySelector("#agendarNome");
    const pedido= f?.querySelector("#agendarPedido");
    const data  = f?.querySelector("#agendarData");
    let   hora  = f?.querySelector("#agendarHora");

    const eNome   = f?.querySelector("#erro-agendar-nome");
    const ePedido = f?.querySelector("#erro-agendar-pedido");
    const eData   = f?.querySelector("#erro-agendar-data");
    const eHora   = f?.querySelector("#erro-agendar-hora");

    const setErrLoc = (el, span, msg) => {
      if (el) el.classList.toggle("input-erro", !!msg);
      if (span) span.textContent = msg || "";
      return !msg;
    };

    const showAgendar = () => {
      if (!containerAgendar) return;
      containerAgendar.style.display = "flex";
      document.body.classList.add("modal-open");
      modalAgendar?.focus?.();
    };

    const hideAgendar = () => {
      if (!containerAgendar) return;
      containerAgendar.style.display = "none";
      document.body.classList.remove("modal-open");
    };

    // cria dropdown com intervalos de 1h entre os horarios permitidos
    const ensureHourDropdown = () => {
      if (!f) return;
      const makeSelect = () => {
        const sel = document.createElement("select");
        sel.id = "agendarHora";
        sel.name = (hora && hora.name) || "agendarHora";
        sel.required = true;

        const opt0 = document.createElement("option");
        opt0.value = "";
        opt0.textContent = "Selecione um horário";
        sel.appendChild(opt0);

        for (let h = 10; h <= 17; h++) {
          const label = `${String(h).padStart(2,"0")}:00`;
          const opt = document.createElement("option");
          opt.value = label;
          opt.textContent = label;
          sel.appendChild(opt);
        }
        return sel;
      };

      if (hora && hora.tagName?.toLowerCase() === "select") {
        const rebuilt = makeSelect();
        const current = hora.value;
        hora.innerHTML = "";
        Array.from(rebuilt.options).forEach(o => hora.appendChild(o.cloneNode(true)));
        if ([...hora.options].some(o => o.value === current)) hora.value = current;
      } else {
        const sel = makeSelect();
        if (hora && hora.parentNode) {
          hora.parentNode.replaceChild(sel, hora);
        } else if (data && data.parentNode) {
          data.parentNode.insertBefore(sel, data.nextSibling);
        } else {
          f.appendChild(sel);
        }
        hora = sel;
      }

      hora.addEventListener("change", validaHora);
    };

    // bloqueia datas passadas e finais de semana
    const setupDateConstraints = () => {
      if (!data) return;
      const toYMD = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };
      const todayStr = toYMD(new Date());
      data.setAttribute("min", todayStr);

      data.addEventListener("change", validaData);
      if (data.value) validaData();
    };

    const isWeekend = (d) => {
      const day = d.getDay(); // 0 dom, 6 sáb
      return day === 0 || day === 6;
    };

    const validaData = () => {
      if (!data) return true;
      const v = data.value;
      if (!v) return setErrLoc(data, eData, "Selecione uma data.");

      const picked = new Date(v + "T00:00:00");
      const minStr = data.getAttribute("min") || v;
      const today = new Date(minStr + "T00:00:00");

      if (picked < today) {
        data.value = "";
        return setErrLoc(data, eData, "Não é possível escolher datas passadas.");
      }
      if (isWeekend(picked)) {
        data.value = "";
        return setErrLoc(data, eData, "Selecione um dia útil (segunda a sexta).");
      }
      return setErrLoc(data, eData, "");
    };

    const validaHora = () => {
      if (!hora) return true;
      const v = hora.value;
      if (!v) return setErrLoc(hora, eHora, "Informe um horário.");
      const H = Number(String(v).split(":")[0]);
      if (Number.isNaN(H) || H < 10 || H > 17) {
        return setErrLoc(hora, eHora, "Horário permitido: 10:00–17:00.");
      }
      return setErrLoc(hora, eHora, "");
    };

    const validaNome   = () => setErrLoc(nome,   eNome,   (nome?.value || "").trim() ? "" : "Informe o nome.");
    const validaPedido = () => setErrLoc(pedido, ePedido, (pedido?.value || "").trim() ? "" : "Informe o número do pedido.");

    btnAgendar?.addEventListener("click", (e) => { e.preventDefault(); showAgendar(); });
    closeAgendar?.addEventListener("click", hideAgendar);
    containerAgendar?.addEventListener("click", (e) => { if (e.target === containerAgendar) hideAgendar(); });

    nome?.addEventListener("blur",   validaNome);
    pedido?.addEventListener("blur", validaPedido);

    ensureHourDropdown();
    setupDateConstraints();

    f?.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = validaNome() & validaPedido() & validaData() & validaHora();
      if (ok) {
        alert("Agendamento enviado! Entraremos em contato para confirmar.");
        hideAgendar();
        f.reset();
      }
    });
  })();

});
