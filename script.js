
function mostrarDoacao() {
  document.getElementById('conteudo').style.display = 'none';
  document.getElementById('impacto').style.display = 'none';
  document.getElementById('doacao').style.display = 'block';
}

function mostrarImpacto() {
  document.getElementById('conteudo').style.display = 'none';
  document.getElementById('doacao').style.display = 'none';
  document.getElementById('impacto').style.display = 'block';
}

function voltarInicio() {
  document.getElementById('conteudo').style.display = 'block';
  document.getElementById('impacto').style.display = 'none';
  document.getElementById('doacao').style.display = 'none';
}

// Submissão da doação
const form = document.getElementById('formDoacao');
const mensagem = document.getElementById('mensagemResultado');
const googleScriptURL = 'https://script.google.com/macros/s/AKfycbzYobdMZJK2gO2zxO3u1e3ID_vACuFj7MiwQg109CEveGzguTihB1moBQjd6ur4RDU1hw/exec';

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      valor: document.getElementById('valor').value
    };

    try {
      const response = await fetch(googleScriptURL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        mensagem.innerText = "✅ Sua doação foi registrada com sucesso!";
        mensagem.style.opacity = 1;
        form.reset();
      } else {
        mensagem.innerText = "⚠️ Erro ao registrar a doação.";
        mensagem.style.opacity = 1;
      }
    } catch (error) {
      mensagem.innerText = "⚠️ Erro de conexão.";
      mensagem.style.opacity = 1;
    }
  });
}
