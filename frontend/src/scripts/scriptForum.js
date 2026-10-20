const userId = localStorage.getItem("userId") || 0;
const token = localStorage.getItem("token");
const SALA = document.body.dataset.chatRoom || "geral";
const CHAT_SERVER_URL = "http://localhost:3001";
const socket = io(CHAT_SERVER_URL, { auth: { token } });
const msgArea = document.getElementById("messages-area");

socket.on("connect", () => socket.emit("joinRoom", { sala: SALA }));
socket.on("connect_error", (err) => console.error("Erro de conexão WebSocket:", err.message));
socket.on("avisoPalavrao", (mensagem) => window.alert(mensagem));

function nomeArquivoDaUrl(url) {
  const nomeSalvo = decodeURIComponent(url.split("/").pop() || "arquivo");
  return nomeSalvo.replace(/^\d+_[a-f0-9]+__/, "").replace(/_/g, " ");
}

function appendMessage(nome, texto, date, type, imagem = null) {
  const empty = document.querySelector(".chat-empty");
  if (empty) empty.remove();

  const wrapper = document.createElement("div");
  wrapper.classList.add("msg", type);
  const avatar = document.createElement("div");
  avatar.classList.add("msg-avatar");
  avatar.textContent = (nome || "?").split(" ").map((parte) => parte[0]).join("").toUpperCase().slice(0, 2);
  const col = document.createElement("div");
  col.classList.add("msg-col");

  if (type === "received") {
    const sender = document.createElement("span");
    sender.classList.add("msg-sender");
    sender.textContent = nome;
    col.appendChild(sender);
  }

  const bubble = document.createElement("div");
  bubble.classList.add("msg-bubble");
  if (texto) {
    const messageText = document.createElement("div");
    messageText.textContent = texto;
    bubble.appendChild(messageText);
  }

  if (imagem) {
    const fileName = nomeArquivoDaUrl(imagem);
    const fileUrl = `${CHAT_SERVER_URL}${imagem}`;
    const extensao = fileName.split(".").pop().toLowerCase();
    const attachment = document.createElement("div");
    attachment.classList.add("msg-attachment");

    if (["png", "jpg", "jpeg", "gif", "webp"].includes(extensao)) {
      const imageLink = document.createElement("a");
      imageLink.href = fileUrl;
      imageLink.target = "_blank";
      imageLink.rel = "noopener noreferrer";
      const image = document.createElement("img");
      image.src = fileUrl;
      image.alt = fileName;
      image.classList.add("msg-attachment-image");
      image.loading = "lazy";
      imageLink.appendChild(image);
      attachment.appendChild(imageLink);
    }

    const fileLink = document.createElement("a");
    fileLink.href = fileUrl;
    fileLink.target = "_blank";
    fileLink.rel = "noopener noreferrer";
    fileLink.classList.add("msg-attachment-link");
    const fileIcon = document.createElement("i");
    fileIcon.className = "ri-attachment-2";
    const fileLabel = document.createElement("span");
    fileLabel.textContent = fileName;
    fileLink.append(fileIcon, fileLabel);
    attachment.appendChild(fileLink);
    bubble.appendChild(attachment);
  }

  const time = document.createElement("span");
  time.classList.add("msg-time");
  time.textContent = new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  col.appendChild(bubble);
  col.appendChild(time);
  wrapper.appendChild(avatar);
  wrapper.appendChild(col);
  msgArea.appendChild(wrapper);
  msgArea.scrollTop = msgArea.scrollHeight;
}

function renderMessage(message) {
  const type = String(message.users_id) === String(userId) ? "sent" : "received";
  appendMessage(message.nome, message.texto, message.data_envio, type, message.imagem);
}

socket.on("historico", (mensagens) => mensagens.forEach(renderMessage));
socket.on("receiveMessage", renderMessage);

const input = document.getElementById("input-submit");
const btnSend = document.getElementById("btn-submit");
function sendMessage() {
  const texto = input.value.trim();
  if (!texto) return;
  if (!socket.connected) return window.alert("Sem conexão com o chat. Tente novamente.");
  socket.emit("sendMessage", { sala: SALA, mensagem: texto });
  input.value = "";
}
btnSend.addEventListener("click", sendMessage);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendMessage();
});