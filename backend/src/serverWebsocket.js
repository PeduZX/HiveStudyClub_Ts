const express = require("express");
const http = require("http");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const palavraJWT = require("./config/auth");
const cors = require("cors");
const { distance } = require("fastest-levenshtein");
const db = require("./config/database");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => res.send("Servidor WebSocket rodando!"));
const uploadDirectory = path.join(__dirname, "../../frontend/src/uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });
app.use("/uploads", express.static(uploadDirectory));

function autenticarUpload(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Token não enviado" });

  try {
    req.user = jwt.verify(token, palavraJWT);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

const extensoesPermitidas = new Set([
  ".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".gif", ".webp",
]);

const uploadArquivo = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
      const extensao = path.extname(file.originalname).toLowerCase();
      const nomeBase = path
        .basename(file.originalname, path.extname(file.originalname))
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 80) || "arquivo";
      callback(null, `${Date.now()}_${crypto.randomBytes(5).toString("hex")}__${nomeBase}${extensao}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    if (!extensoesPermitidas.has(extensao)) {
      return callback(new Error("Envie PDF, Word ou imagem PNG, JPG, GIF ou WEBP."));
    }
    callback(null, true);
  },
});

app.post("/uploadChat", autenticarUpload, (req, res) => {
  uploadArquivo.single("arquivo")(req, res, (err) => {
    if (err) {
      const status = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({ error: status === 413 ? "O arquivo deve ter no máximo 10 MB." : err.message });
    }
    if (!req.file) return res.status(400).json({ error: "Selecione um arquivo." });

    res.json({
      url: `/uploads/${encodeURIComponent(req.file.filename)}`,
      nome: req.file.originalname,
    });
  });
});

const PONTOS_TEXTO = 5;
const PONTOS_IMAGEM = 15;
const COOLDOWN_MS = 10000;
const ultimaPontuacao = new Map();

function adicionarPontos(userId, pontos, cb) {
  const query = "UPDATE users SET pontos = pontos + ? WHERE id = ?";
  db.query(query, [pontos, userId], cb);
}

function normalizar(p) {
  return p
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

function colapsarRepeticao(s) {
  let out = "";
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    const tamanho = j - i;
    out += tamanho >= 3 ? s[i] : s.slice(i, j);
    i = j;
  }
  return out;
}

const ABREVIACOES = new Set([
  "pq",
  "vc",
  "vcs",
  "tb",
  "tbm",
  "blz",
  "vlw",
  "obg",
  "hj",
  "td",
  "tds",
  "mt",
  "mto",
  "pra",
  "pro",
  "ta",
  "to",
  "ne",
  "oq",
  "cmg",
  "ctg",
  "flw",
  "msg",
]);

const DICIONARIO = new Set();
const POR_TAMANHO = new Map();

const caminhoDicionario = path.join(__dirname, "utils", "palavras-ptbr.txt");

fs.readFileSync(caminhoDicionario, "utf8")
  .split(/\r?\n/)
  .map(normalizar)
  .filter(Boolean)
  .forEach((w) => {
    if (DICIONARIO.has(w)) return;
    DICIONARIO.add(w);
    if (!POR_TAMANHO.has(w.length)) POR_TAMANHO.set(w.length, []);
    POR_TAMANHO.get(w.length).push(w);
  });

function palavraValida(bruta) {
  const p = colapsarRepeticao(normalizar(bruta));

  if (ABREVIACOES.has(p)) return true;
  if (p.length < 2) return false;
  if (DICIONARIO.has(p)) return true;
  if (p.length < 4) return false;

  const maxDist = p.length >= 8 ? 2 : 1;
  for (let len = p.length - maxDist; len <= p.length + maxDist; len++) {
    for (const w of POR_TAMANHO.get(len) || []) {
      if (distance(p, w) <= maxDist) return true;
    }
  }
  return false;
}

function mensagemValida(texto) {
  return texto.trim().split(/\s+/).some(palavraValida);
}

const PALAVROES = new Set([
  "porra",
  "caralho",
  "merda",
  "puta",
  "pqp",
  "fdp",
  "buceta",
  "viado",
  "arrombado",
  "cacete",
  "foder",
  "foda",
  "bosta",
  "cuzao",
  "puta merda",
  "cu",
  "vai toma no cu",
  "vtnc",
  "se foda",
  "te fode",
]);

const LEET = { 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", "@": "a", $: "s" };

function limparPalavra(p) {
  const base = p
    .toLowerCase()
    .replace(/[01345@$]/g, (c) => LEET[c] || c)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
  return colapsarRepeticao(base);
}

function temPalavrao(texto) {
  return texto.split(/\s+/).some((p) => PALAVROES.has(limparPalavra(p)));
}

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Token não enviado"));

  try {
    const decoded = jwt.verify(token, palavraJWT);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Token inválido ou expirado"));
  }
});

io.on("connection", (socket) => {
  console.log(`Usuario conectado: ${socket.user.nome}`);

  socket.on("joinRoom", ({ sala }) => {
    socket.join(sala);
    console.log(`${socket.user.nome} entrou na sala: ${sala}`);

    const sql = `
      SELECT m.texto, m.imagem_url AS imagem, m.data_envio, m.users_id, u.nome, u.fotoPerfil
      FROM mensagensForum m
      JOIN users u ON m.users_id = u.id
      WHERE m.sala = ?
      ORDER BY m.data_envio ASC
      LIMIT 50
    `;

    db.query(sql, [sala], (err, results) => {
      if (err) {
        console.error("Erro ao buscar mensagens:", err);
        return;
      }
      socket.emit("historico", results);
    });
  });

  socket.on("sendMessage", ({ sala, mensagem = "", imagem = null }) => {
    const texto = mensagem.trim();
    if (!texto && !imagem) return;

    if (imagem && !imagem.startsWith("/uploads/")) return;

    const userId = socket.user.userId;
    const nome = socket.user.nome;

    const sql =
      "INSERT INTO mensagensForum (users_id, sala, texto, imagem_url) VALUES (?, ?, ?, ?)";
    db.query(sql, [userId, sala, texto, imagem], (err, result) => {
      if (err) {
        console.error("Erro ao salvar mensagem:", err);
        return;
      }

      const novaMensagem = {
        id: result.insertId,
        nome: nome,
        users_id: userId,
        texto: texto,
        imagem: imagem,
        sala: sala,
        data_envio: new Date(),
      };

      io.to(sala).emit("receiveMessage", novaMensagem);

      let pontos = 0;

      if (imagem) {
        pontos = PONTOS_IMAGEM;
      } else if (temPalavrao(texto)) {
        pontos = -PONTOS_TEXTO;
        socket.emit(
          "avisoPalavrao",
          "Mensagem contém palavrões; pontos reduzidos.",
        );
      } else if (mensagemValida(texto)) {
        pontos = PONTOS_TEXTO;
      }

      const agora = Date.now();
      if (
        pontos !== 0 &&
        agora - (ultimaPontuacao.get(userId) || 0) >= COOLDOWN_MS
      ) {
        ultimaPontuacao.set(userId, agora);

        adicionarPontos(userId, pontos, (errPontos) => {
          if (errPontos) {
            console.error("Erro ao adicionar pontos:", errPontos);
            return;
          }
          socket.emit("pontosAdicionados", { pontos });
        });
      }
    });
  });

  socket.on("disconnect", () => {
    console.log(`Usuario desconectado: ${socket.user.nome}`);
  });
});

app.post("/addPontos/:id", (req, res) => {
  const usersId = req.params.id;
  const { pontos } = req.body;

  adicionarPontos(usersId, pontos, (err) => {
    if (err) {
      console.error("Erro ao adicionar pontos:", err);
      return res.status(500).json({ error: "Erro ao adicionar pontos" });
    }
    res.json({ message: "Pontos adicionados com sucesso!" });
  });
});

server.listen(3001, () => {
  console.log("Servidor WebSocket rodando na porta 3001");
});
