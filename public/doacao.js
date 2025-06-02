function myFunction(value) {
  var element = document.getElementById("hidden-text");
  element.style.display = "block";
}
function mostar_pix(value) {
  var element = document.getElementById("pix-container");
  element.style.display = "contents";
}

function fadeOut(element, href) {
  let opacity = 1;
  const interval = setInterval(() => {
    opacity -= 0.1;
    element.style.opacity = opacity;
    if (opacity <= -1.0) {
      clearInterval(interval);
      window.location.href = href;
    }
  }, 50);
}
window.addEventListener("DOMContentLoaded", () => {
  window.voltarInicio = () => {
    var element = document.body;
    fadeOut(element, "/");
  };
});

async function fazer_pagamento(data) {
  const response = await fetch("/api" + "/register_donation", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function pagar() {
  const element = document.getElementById("valor");
  data = {};
  data.valor = 12;
  fazer_pagamento(data).then();
}
