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

  window.mostrarDoacao = () => {
    fadeOut(current, "/doacao");
  };

  window.mostrar_login = () => {
    console.log("i was clicked");
    current.style.display = "none";
    current = document.getElementById("login");
    current.style.display = "block";
  };
  window.mostrar_signin = () => {
    console.log("i was clicked");
    current.style.display = "none";
    current = document.getElementById("sign-in-usuario");
    current.style.display = "block";
  };

  window.mostrarImpacto = () => {
    fadeOut(current, "/impacto");

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
    const email = document.getElementById("email_login").value;
    const password = document.getElementById("password_login").value;
    var data;
    console.log("email :" + email + "password: " + password);
    if ((email != undefined) & (password != undefined)) {
      data = { email: email, password: password };
      handle_login_form(data).then(() => {
        window.location.href = "/";
      });
      console.log("recieved cookie");
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
  console.log("handling login form");
  const response = await fetch("/api/login_form", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
    cookie = response.body;
    console.log("loged in with success");
  }
}

function myFunction(value) {
  alert("You selected: " + value);
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
  if (response.ok) {
    cookie = response.body;
    console.log("loged in with success");
  }
}
function cadastrar() {
  data = {};
  data.email = "aaa@";
  data.username = "nicky";
  data.password = "senha";
  console.debug(data);
  handle_cadastrar(data).then();
}
