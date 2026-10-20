const overlay = document.getElementById("uploadOverlay");
const btnAttach = document.getElementById("btn-add-document");
const uploadClose = document.getElementById("uploadClose");
const uploadCancel = document.getElementById("uploadCancel");
const uploadSend = document.getElementById("uploadSend");
const fileInput = document.getElementById("input-add-document");
const dropZone = document.getElementById("dropZone");
const uploadPreview = document.getElementById("uploadPreview");
const previewName = document.getElementById("previewName");
const previewSize = document.getElementById("previewSize");
const previewIcon = document.getElementById("previewIcon");
const previewRemove = document.getElementById("previewRemove");

let selectedFile = null;
const extensoesPermitidas = ["pdf", "doc", "docx", "png", "jpg", "jpeg", "gif", "webp"];

function iconForFile(name) {
  const extensao = name.split(".").pop().toLowerCase();
  if (extensao === "pdf") return "ri-file-pdf-line";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(extensao)) return "ri-image-line";
  if (["doc", "docx"].includes(extensao)) return "ri-file-word-line";
  return "ri-file-line";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function clearFile() {
  selectedFile = null;
  fileInput.value = "";
  uploadPreview.classList.remove("visible");
  uploadSend.classList.remove("ready");
}

function setFile(file) {
  const extensao = file.name.split(".").pop().toLowerCase();
  if (!extensoesPermitidas.includes(extensao)) {
    window.alert("Envie PDF, Word ou imagem PNG, JPG, GIF ou WEBP.");
    clearFile();
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    window.alert("O arquivo deve ter no máximo 10 MB.");
    clearFile();
    return;
  }
  selectedFile = file;
  previewName.textContent = file.name;
  previewSize.textContent = formatBytes(file.size);
  previewIcon.className = iconForFile(file.name);
  uploadPreview.classList.add("visible");
  uploadSend.classList.add("ready");
}

function closeUpload() {
  overlay.classList.remove("is-open");
  clearFile();
}

btnAttach.addEventListener("click", () => overlay.classList.add("is-open"));
uploadClose.addEventListener("click", closeUpload);
uploadCancel.addEventListener("click", closeUpload);
overlay.addEventListener("click", (event) => {
  if (event.target === overlay) closeUpload();
});
dropZone.addEventListener("click", (event) => {
  if (event.isTrusted && event.target !== fileInput) fileInput.click();
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length) setFile(fileInput.files[0]);
});
previewRemove.addEventListener("click", clearFile);
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("drag-over");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("drag-over");
  const file = event.dataTransfer.files[0];
  if (file) setFile(file);
});

uploadSend.addEventListener("click", async () => {
  if (!selectedFile || uploadSend.disabled) return;
  const token = localStorage.getItem("token");
  if (!token) return window.alert("Entre na sua conta para enviar arquivos.");
  if (!socket.connected) return window.alert("Sem conexão com o chat. Tente novamente.");

  const formData = new FormData();
  formData.append("arquivo", selectedFile);
  uploadSend.disabled = true;

  try {
    const response = await fetch("http://localhost:3001/uploadChat", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Não foi possível enviar o arquivo.");
    socket.emit("sendMessage", { sala: SALA, mensagem: "", imagem: data.url });
    closeUpload();
  } catch (error) {
    window.alert(error.message || "Erro ao enviar o arquivo.");
  } finally {
    uploadSend.disabled = false;
  }
});