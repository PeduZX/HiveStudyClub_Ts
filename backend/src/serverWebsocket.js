// ══════════════════════════════════════════════
//  serverWebsocket.js — Servidor de Chat em Tempo Real
//  Hive Study Club — Socket.io + Express + MySQL
// ══════════════════════════════════════════════

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const jwt        = require('jsonwebtoken');
const cors       = require('cors');
const db         = require('./config/database');

const SECRET = 'sua_chave_secreta_aqui'; // mesma do server.js

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.get('/', (req, res) => res.send('Servidor WebSocket rodando!'));

// ── Valida o token antes de aceitar qualquer conexão ──
// Mesma lógica do autenticar() do server.js — token com { userId, nome }
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Token não enviado'));

  try {
    const decoded = jwt.verify(token, SECRET);
    socket.user = decoded; // salva { userId, nome } no socket
    next();
  } catch {
    next(new Error('Token inválido ou expirado'));
  }
});

// ══════════════════════════════════════════════
//  EVENTOS DO SOCKET.IO
// ══════════════════════════════════════════════

io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.user.nome}`);

  // ── 1. Usuário entra em uma sala ──
  socket.on('joinRoom', ({ sala }) => {
    socket.join(sala);
    console.log(`${socket.user.nome} entrou na sala: ${sala}`);

    // Busca as últimas 50 mensagens da sala e manda só pra quem entrou
    const sql = `
      SELECT m.texto, m.data_envio, m.users_id, u.nome, u.fotoPerfil
      FROM mensagensForum m
      JOIN users u ON m.users_id = u.id
      WHERE m.sala = ?
      ORDER BY m.data_envio ASC
      LIMIT 50
    `;

    db.query(sql, [sala], (err, results) => {
      if (err) {
        console.error('Erro ao buscar mensagens:', err);
        return;
      }
      socket.emit('historico', results);
    });
  });

  // ── 2. Usuário envia uma mensagem ──
  // userId e nome vêm do token — não do frontend
  socket.on('sendMessage', ({ sala, mensagem }) => {
    if (!mensagem.trim()) return;

    const userId = socket.user.userId;
    const nome   = socket.user.nome;

    const sql = 'INSERT INTO mensagensForum (users_id, sala, texto) VALUES (?, ?, ?)';
    db.query(sql, [userId, sala, mensagem], (err, result) => {
      if (err) {
        console.error('Erro ao salvar mensagem:', err);
        return;
      }

      const novaMensagem = {
        id:         result.insertId,
        nome:       nome,
        users_id:   userId,
        texto:      mensagem,
        sala:       sala,
        data_envio: new Date()
      };

      // Emite pra todos na sala (incluindo quem enviou)
      io.to(sala).emit('receiveMessage', novaMensagem);
    });
  });

  // ── 3. Usuário desconecta ──
  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.user.nome}`);
  });
});

// Porta 3001 para não conflitar com o servidor principal (porta 3000)
server.listen(3001, () => {
  console.log('Servidor WebSocket rodando na porta 3001');
});