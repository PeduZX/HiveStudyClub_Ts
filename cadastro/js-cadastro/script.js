// ========================
// Cadastro
// ========================
async function cadastrar() {
  const nome = document.getElementById("input-nome").value.trim();
  const email = document.getElementById("input-email").value.trim();
  const dataNasc = document.getElementById("input-data").value;
  const senha = document.getElementById("input-senha").value.trim();
  const nomeAreaMentorar = document.getElementById("select-mentorar").value;
  const nomeAreaMentorado = document.getElementById("select-mentorado").value;

  try {
    const res1 = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, dataNasc, senha }),
    });

    const data1 = await res1.json();

    if (!res1.ok) {
      document.getElementById("msg").innerText = data1.error;
      return;
    }

    localStorage.setItem("token", data1.token);
    localStorage.setItem("userId", data1.userId);
    localStorage.setItem("nome", data1.nome);

    const res2 = await fetch("http://localhost:3000/registerAreas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomeAreaMentorar,
        nomeAreaMentorado,
        users_id: data1.userId,
      }),
    });

    const data2 = await res2.json();

    if (!res2.ok) {
      document.getElementById("msg").innerText = data2.message;
      return;
    }

    window.location.href = "login.html"; // ← agora vai para login

  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Erro no cadastro.";
  }
}

// ========================
// Login
// ========================
async function login() {
  const email = document.getElementById("input-email").value.trim();
  const senha = document.getElementById("input-senha").value.trim();

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (!response.ok) {
      document.getElementById("msg").innerText = data.error;
      document.getElementById("msg").style.color = "red";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("nome", data.nome);
    localStorage.setItem("email", data.email);

    window.location.href = "perfil.html"; // ← vai para perfil

  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Erro no login.";
  }
}

// ========================
// Perfil — carrega ao abrir a página
// ========================
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const nome = localStorage.getItem("nome");
  const email = localStorage.getItem("email");

  // Troca botão "Faça Login" pelo nome do usuário em qualquer página
  const loginBtn = document.querySelector(".login-btn");
  if (loginBtn) {
    if (token && nome) {
      loginBtn.textContent = nome;
      loginBtn.href = "perfil.html";
    } else {
      loginBtn.textContent = "Faça Login";
      loginBtn.href = "login.html";
    }
  }

  // Só roda o resto se for a página de perfil
  const emailPerfil = document.getElementById("profileEmail");
  const isPaginaProtegida = document.getElementById("profileName");
  if (!isPaginaProtegida) return;

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("profileName").textContent = nome || "Usuário";
  document.getElementById("input-nome").value = nome || "";
  document.getElementById("profileEmail").textContent = localStorage.getItem("email") || "email@gmail.com";
});

// ========================
// Editar perfil
// ========================
async function editarUser() {
  const token = localStorage.getItem("token");
  const inputNome = document.getElementById("input-nome").value.trim();
  const inputSenha = document.getElementById("input-senha").value.trim();

  if (!inputNome || !inputSenha) {
    alert("Preencha nome e nova senha para salvar.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/editarUser", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ inputNome, inputSenha }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("nome", data.nome);
      document.getElementById("profileName").textContent = data.nome;
      alert("Perfil atualizado com sucesso!");
    } else if (response.status === 401) {
      alert("Sessão expirada. Faça login novamente.");
      localStorage.clear();
      window.location.href = "login.html";
    } else {
      alert(data.error || "Erro ao editar.");
    }

  } catch (err) {
    console.error(err);
    alert("Erro de conexão.");
  }
}

// ========================
// Logout
// ========================
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}