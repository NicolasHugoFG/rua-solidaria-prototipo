window.addEventListener("DOMContentLoaded", () => {
  let totalDoacoes = 0;
  let doacoesPorInstituicao = {
    "Instituto Ramacrisma": 0,
    "Pão dos Pobres": 0,
  };

  window.mostrarDoacao = () => {
    const conteudo = document.getElementById("conteudo");
    const doacao = document.getElementById("doacao");
    const valoresArrecadados = document.getElementById("valores-arrecadados");

    if (conteudo) conteudo.style.display = "none";
    if (valoresArrecadados) valoresArrecadados.style.display = "none";
    if (doacao) doacao.style.display = "block";
  };

  window.mostrarImpacto = () => {
    const conteudo = document.getElementById("conteudo");
    const doacao = document.getElementById("doacao");
    const valoresArrecadados = document.getElementById("valores-arrecadados");

    if (conteudo) conteudo.style.display = "none";
    if (doacao) doacao.style.display = "none";
    if (valoresArrecadados) {
      valoresArrecadados.style.display = "block";
      atualizarContador();
    }
  };

  window.voltarInicio = () => {
    const conteudo = document.getElementById("conteudo");
    const doacao = document.getElementById("doacao");
    const valoresArrecadados = document.getElementById("valores-arrecadados");

    if (conteudo) conteudo.style.display = "block";
    if (valoresArrecadados) valoresArrecadados.style.display = "none";
    if (doacao) doacao.style.display = "none";
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
        totalDoacoes += valor;
        doacoesPorInstituicao[instituicao] += valor;

        atualizarContador();
        alert(
          `✅ Sua doação de R$ ${valor.toFixed(2)} foi registrada para ${instituicao}!`,
        );
        form.reset();
      } else {
        alert(
          "⚠️ Por favor, insira um valor válido e selecione uma instituição.",
        );
      }
    });
  }

  const atualizarContador = () => {
    const contador = document.getElementById("contador");
    const ramacrismaTotal = document.getElementById("ramacrismaTotal");
    const paoPobresTotal = document.getElementById("paoPobresTotal");

    if (contador) contador.textContent = `R$ ${totalDoacoes.toFixed(2)}`;
    if (ramacrismaTotal)
      ramacrismaTotal.textContent = `R$ ${doacoesPorInstituicao["Instituto Ramacrisma"].toFixed(2)}`;
    if (paoPobresTotal)
      paoPobresTotal.textContent = `R$ ${doacoesPorInstituicao["Pão dos Pobres"].toFixed(2)}`;
  };
});

