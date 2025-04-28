const form = document.getElementById('formDoacao');
const mensagem = document.getElementById('mensagemResultado');

// Coloque seu link do Google Apps Script aqui:
const googleScriptURL = 'https://script.google.com/macros/s/SEU-LINK-AQUI/exec';

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
