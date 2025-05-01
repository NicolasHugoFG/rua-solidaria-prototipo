function mostrarDoacao() {
  document.getElementById("conteudo").style.display = "none";
  document.getElementById("impacto").style.display = "none";
  document.getElementById("doacao").style.display = "block";
}

function mostrarImpacto() {
  document.getElementById("conteudo").style.display = "none";
  document.getElementById("doacao").style.display = "none";
  document.getElementById("impacto").style.display = "block";
}

function voltarInicio() {
  document.getElementById("conteudo").style.display = "block";
  document.getElementById("impacto").style.display = "none";
  document.getElementById("doacao").style.display = "none";
}

// Submissão da doação
const form = document.getElementById("formDoacao");
const mensagem = document.getElementById("mensagemResultado");
// const googleScriptURL = 'http://localhost/rua_solidaria/registrar_doacao.php';
const api = "http://localhost:3000/api";

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      valor: document.getElementById("valor").value,
      instituicao: 1,
    };

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
  });
}
