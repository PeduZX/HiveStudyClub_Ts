

const userId   = localStorage.getItem('userId') || 0;
const nomeUser = localStorage.getItem('nome')   || 'Anonimo';
const token    = localStorage.getItem('token');
const SALA     = 'geral';

// Passa o token na conexão — o servidor valida antes de aceitar
const socket = io('http://localhost:3001', {
  auth: { token }
});

// Quando conectar, entra na sala (sem enviar userId/nome — vêm do token no servidor)
socket.on('connect', () => {
  socket.emit('joinRoom', { sala: SALA });
});

// Se o token for inválido, cai aqui
socket.on('connect_error', (err) => {
  console.error('Erro de conexão WebSocket:', err.message);
});

// ── Renderiza uma mensagem na tela ──
const msgArea = document.getElementById('messages-area');

function appendMessage(nome, texto, date, type) {
  const empty = document.querySelector('.chat-empty');
  if (empty) empty.remove();

  const wrapper = document.createElement('div');
  wrapper.classList.add('msg', type);

  const avatar = document.createElement('div');
  avatar.classList.add('msg-avatar');
  avatar.textContent = nome.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

  const col = document.createElement('div');
  col.classList.add('msg-col');

  // Mostra o nome só nas mensagens recebidas
  if (type === 'received') {
    const sender = document.createElement('span');
    sender.classList.add('msg-sender');
    sender.textContent = nome;
    col.appendChild(sender);
  }

  const bubble = document.createElement('div');
  bubble.classList.add('msg-bubble');
  bubble.textContent = texto;

  const time = document.createElement('span');
  time.classList.add('msg-time');
  time.textContent = new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  col.appendChild(bubble);
  col.appendChild(time);
  wrapper.appendChild(avatar);
  wrapper.appendChild(col);
  msgArea.appendChild(wrapper);
  msgArea.scrollTop = msgArea.scrollHeight;
}

// ── Recebe histórico ao entrar na sala ──
socket.on('historico', (mensagens) => {
  mensagens.forEach(msg => {
    const type = String(msg.users_id) === String(userId) ? 'sent' : 'received';
    appendMessage(msg.nome, msg.texto, msg.data_envio, type);
  });
});

// ── Recebe mensagem nova em tempo real ──
socket.on('receiveMessage', (msg) => {
  const type = String(msg.users_id) === String(userId) ? 'sent' : 'received';
  appendMessage(msg.nome, msg.texto, msg.data_envio, type);
});

// ── Envia mensagem — só manda sala e texto, userId/nome vêm do token ──
const input   = document.getElementById('input-submit');
const btnSend = document.getElementById('btn-submit');

function sendMessage() {
  const texto = input.value.trim();
  if (!texto) return;
  socket.emit('sendMessage', { sala: SALA, mensagem: texto });
  input.value = '';
}

btnSend.addEventListener('click', sendMessage);
input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });