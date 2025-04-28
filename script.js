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

// Substitua pelo seu link do Google Apps Script!
const googleScriptURL = 'https://script.google.com/macros/s/https://script.google.com/macros/s/AKfycbyqhx-lQezo_bzb3o0nLuHNbpUPE4seydI8veT4RulX_-DXh4O7X_1I6pb_TnSihGSnIA/exec/exec';

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nome: document.getElementById('nome').value,
    valor: document.getElementById('valor').value,
    mensagem: document.getElementById('mensagem').value
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
      mensagem.innerText = "Doação registrada com sucesso!";
      form.reset();
    } else {
      mensagem.innerText = "Erro ao registrar a doação.";
    }
  } catch (error) {
    mensagem.innerText = "Erro de conexão.";
  }
});

