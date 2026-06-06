const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',     
  password: 'root',     
  database: 'bancoPI' 
});

db.connect((err) => {
  if (err) {
    console.error('Erro de conexão: ', err);
    return;
  }
  console.log('Conectado ao MySQL!');
});

module.exports = db;