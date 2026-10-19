async function carregarPerfil() {
  const id = localStorage.getItem("userId");
  if (!id) return;

  const resp = await fetch(`http://localhost:3000/getUser/${id}`);
  const data = await resp.json();

  if (resp.ok) {
    document.getElementById("profileName").textContent = data.nome;
    document.getElementById("profileEmail").textContent = data.email;
    document.getElementById("pontos").textContent = data.pontos;

    if (!data.fotoPerfil) {
      document.getElementById("avatarImg").src = "../assets/icons/imagem_user.png";
    }

    if (data.fotoPerfil) {
      document.getElementById("avatarImg").src = `http://localhost:3000/${data.fotoPerfil}`;
    }
  }
}

carregarPerfil();

document.querySelector(".avatar-badge").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();

  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;

    const id = localStorage.getItem("userId");
    const formData = new FormData();
    formData.append("fotoPerfil", file);

    try {
      const resp = await fetch(`http://localhost:3000/uploadFoto/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await resp.json();
      
      if (resp.ok) {
        document.getElementById("avatarImg").src = `http://localhost:3000/${data.fotoPerfil}`;
      }
    } catch (err) {
      console.error("Erro ao enviar foto:", err);
    }
  });
});

async function deletarFoto() {
  const id = localStorage.getItem("userId");
  if (!id) return;

  const resp = await fetch(`http://localhost:3000/deletarFoto/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await resp.json();

  if (resp.ok) {
    document.getElementById("avatarImg").src = "../assets/icons/imagem_user.png";
  } else {
    console.error("Erro ao deletar foto:", data.error);
  }
}

async function exibirAreasPerfil() {
  const areaMentor = document.getElementById("area-mentor");
  const areaMentorado = document.getElementById("area-mentorado");
  const id = localStorage.getItem("userId");

  if (!id) return;

  const resp = await fetch(`http://localhost:3000/getAreas/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await resp.json();

  if (!resp.ok) {
    console.error("Erro ao buscar áreas:", data.error);
    return;
  }


  const areasMentor = data.map(item => item.nomeAreaMentorar);

  const areasMentorado = data.map(item => item.nomeAreaMentorado);

  areaMentor.textContent =
    areasMentor.join(", ") || "Nenhuma área selecionada";

  areaMentorado.textContent =
    areasMentorado.join(", ") || "Nenhuma área selecionada";
}

exibirAreasPerfil();