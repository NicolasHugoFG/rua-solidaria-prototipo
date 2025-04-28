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
const form = document.getElementById('formDoacao');
const mensagem = document.getElementById('mensagemResultado');

const googleScriptURL = 'https://script.google.com/macros/s/AKfycbwcJODCjMmLp5dI5Jo_kG2iRh0hnSP5nS-XHTlxpT430KmODI4s6XYO8764EdN-00xLfg/exec';

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
      mensagem.innerText = "✅ Doação registrada com sucesso!";
      form.reset();
    } else {
      mensagem.innerText = "⚠️ Erro ao registrar a doação.";
    }
  } catch (error) {
    mensagem.innerText = "⚠️ Erro de conexão.";
  }
});

  try {
    const response = await fetch(googleScriptURL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      mensagem.innerText = "Doação registrada com sucesso!";
      form.reset();
    } else {
      mensagem.innerText = "Erro ao registrar a doação.";
    }
  } catch (error) {
    mensagem.innerText = "Erro de conexão.";
  }
});

