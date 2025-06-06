function getCookie(name) {
  const cookieName = `${name}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return "";
}

const sessionID = getCookie("sessionID");
async function send_auth() {
  getCookie("session");
  const response = await fetch("/api/auth", {
    method: "GET",
    credentials: "same-origin", // or 'same-origin' or 'include' depending on your needs
  });
}

// send_auth();

function fadeOut(element, href) {
  let opacity = 1;
  const interval = setInterval(() => {
    opacity -= 0.05;
    element.style.opacity = opacity;
    if (opacity <= 0) {
      clearInterval(interval);
      window.location.href = href;
    }
  }, 50);
}
window.addEventListener("DOMContentLoaded", () => {
  let totalDoacoes = 0;
  let doacoesPorInstituicao = {
    "Instituto Ramacrisma": 0,
    "Pão dos Pobres": 0,
  };
  let current = document.getElementById("conteudo");
  console.debug(current);

  window.mostrar_pix = () => {
    document.getElementById("pix-container").style = "display: block";
  };

  window.mostrarDoacao = () => {
    htmx.ajax("GET", "/doacao", {
      target: "#main-content",
      swap: "outerHTML",
    });
  };
  window.ir_para_pagina_de_admins = () => {
    htmx.ajax("GET", "/admins", {
      target: "#main-content",
      swap: "outerHTML",
    });
  };

  window.editar_foto = (id) => {
    const input = document.getElementById("fileInput");
    input.addEventListener("change", (event) => {
      const file = input.files?.[0];
      const formData = new FormData();
      formData.append("image", file); // "image" is the field name on the server
      console.log(id);

      fetch("/api/upload/" + id, {
        method: "POST",
        body: formData,
      }).then(() => {
        window.location.reload();
      });
    });
    input.click();
  };
  window.como_doar = () => {
    document.getElementById("infoComoDoar").style = "display:block";
  };
  window.save_profile = () => {
    const name = document.getElementById("profile_name").textContent;
    const description = document.getElementById(
      "profile_description",
    ).textContent;
    const data = { name, description };
    console.debug(data);
    fetch("/api" + "/save_profile", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (!response.ok) {
        alert("error updating");
      } else {
        window.location.reload();
      }
    });
  };
  window.mostrar_mapa = () => {
    window.location.href = "mapa.html";
  };
  window.logout = () => {
    fetch("/api" + "/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      window.location.href = "/";
    });
  };

  window.mostrar_login = () => {
    htmx.ajax("GET", "/login.html", {
      target: "#main-content",
      swap: "outerHTML",
    });
  };
  window.mostrar_conta = (conta) => {
    console.log("going:", conta);
    htmx.ajax("GET", conta, {
      target: "#main-content",
      swap: "outerHTML",
    });
  };
  window.mostrar_signin = () => {
    htmx.ajax("GET", "/sign-in.html", {
      target: "#main-content",
      swap: "outerHTML",
    });
  };
  window.return_to_home = () => {
    htmx.ajax("GET", "/index-content", {
      target: "#main-content",
      swap: "outerHTML",
    });
  };

  window.mostrarImpacto = () => {
    htmx.ajax("GET", "/impacto", {
      target: "#main-content",
      swap: "outerHTML",
    });

    // current = document.getElementById("valores-arrecadados");
    // current.style.display = "block";
  };

  window.voltarInicio = () => {
    const conteudo = document.getElementById("conteudo");
    const doacao = document.getElementById("doacao");
    const valoresArrecadados = document.getElementById("valores-arrecadados");

    if (conteudo) conteudo.style.display = "block";
    if (valoresArrecadados) valoresArrecadados.style.display = "none";
    if (doacao) doacao.style.display = "none";
  };

  window.myFunction = (value) => {
    console.log("changed ", value);
  };

  const mensagem = document.getElementById("mensagemResultado");
  const googleScriptURL = "http://localhost/rua_solidaria/registrar_doacao.php";

  const btnComoDoar = document.getElementById("btnComoDoar");
  if (btnComoDoar) {
    btnComoDoar.addEventListener("click", () => {
      const info = document.getElementById("infoComoDoar");
      if (info.style.display === "none" || info.style.display === "") {
        info.style.display = "block";
      } else {
        info.style.display = "none";
      }
    });
  }

  const form = document.getElementById("formDoacao");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const valor = parseFloat(document.getElementById("valor").value);
      const instituicao = document.getElementById("instituicao").value;

      if (!isNaN(valor) && valor > 0 && instituicao) {
        const data = {
          valor: valor,
          instituicao: instituicao,
        };
        send_donation_form(data).then({});

        `✅ Sua doação de R$ ${valor.toFixed(2)} foi registrada para ${instituicao}!`,
          alert();
        form.reset();
      }
    });
  }

  window.login_form = () => {
    console.log("form sending");
    const username = document.getElementById("email_login").value;
    const password = document.getElementById("password_login").value;
    var data;
    console.log("email :" + username + "password: " + password);
    if ((username != undefined) & (password != undefined)) {
      data = { username: username, password: password };
      handle_login_form(data).then();
    }
  };

  // window.cadastrar = () => {};
});

async function send_donation_form(data) {
  try {
    console.log(JSON.stringify(data));
    const response = await fetch(api + "/register_donation", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      response.text().then((text) => {
        mensagem.innerText =
          "✅ Sua doação foi registrada com sucesso!, id da doaçao: " + text;
        mensagem.style.opacity = 1;
        form.reset();
      });
    } else {
      response.text().then((text) => {
        mensagem.innerText = "⚠️ Erro ao registrar a doação:" + text;
        mensagem.style.opacity = 1;
      });
    }
  } catch (error) {
    mensagem.innerText = "⚠️ Erro de conexão.";
    mensagem.style.opacity = 1;
  }
}
async function handle_login_form(data) {
  console.debug(data);
  const response = await fetch("/api/login_form", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    alert("error in login");
  } else {
    alert("logged in");
    window.location.reload(true);
  }
}

async function handle_cadastrar(data) {
  console.log(JSON.stringify(data));
  const response = await fetch("/api/sign_in", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    alert("erro ao cadastrar");
  } else {
    window.location.reload();
  }
}
function cadastrar() {
  data = {};
  data.email = document.getElementById("email").value;
  data.username = document.getElementById("username").value;
  data.password = document.getElementById("password").value;
  handle_cadastrar(data).then();
}
async function fazer_pagamento(data) {
  const response = await fetch("/api" + "/register_donation", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function post_request() {}

function pagar() {
  const element = document.getElementById("valor");
  data = {};
  data.instituicao = document.getElementById("form-select").value;
  data.message = document.getElementById("message").value;
  data.valor = element.value;
  fazer_pagamento(data).then(alert("doado"));
}
