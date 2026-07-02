# PI---PROJETO-INTEGRADOR

<img width="1254" height="347" alt="image" src="https://github.com/user-attachments/assets/67e20782-3265-44bd-88e4-f47b9b986bf3" />


## npm i express nodemon dotenv multer bcrypt jsonwebtoken socket.io mysql2 cors


CREATE DATABASE bancoPI; 
USE bancoPI; 

CREATE TABLE users ( 
id INT PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR(255) NOT NULL, 
email VARCHAR(255) NOT NULL UNIQUE, 
data_nasc DATE NOT NULL, 
senha VARCHAR(255) NOT NULL, 
pontos INT DEFAULT 0, 
fotoPerfil VARCHAR(255)
);

CREATE TABLE funcoesUser ( 
id_area_mentorar INT PRIMARY KEY AUTO_INCREMENT
, nomeAreaMentorar VARCHAR(100) NOT NULL,
nomeAreaMentorado VARCHAR(100) NOT NULL, 
users_id INT,
FOREIGN KEY (users_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE );

CREATE TABLE mensagensForum (
id_mensagem INT PRIMARY KEY AUTO_INCREMENT,
texto TEXT NOT NULL, 
data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
users_id INT NOT NULL, sala VARCHAR(100) NOT NULL,
imagem_url VARCHAR(255), 
FOREIGN KEY (users_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE );



## O Diagram ER foi feito pelo dbdiagram

Table users {
  id int [pk, increment]
  nome varchar(255) [not null]
  email varchar(255) [not null, unique]
  data_nasc date [not null]
  senha varchar(255) [not null]
  pontos int [default: 0]
  fotoPerfil varchar(255)
}

Table funcoesUser {
  id_area_mentorar int [pk, increment]
  nomeAreaMentorar varchar(100) [not null]
  nomeAreaMentorado varchar(100) [not null]
  users_id int
}

Table mensagensForum {
  id_mensagem int [pk, increment]
  texto text [not null]
  data_envio datetime [default: `CURRENT_TIMESTAMP`]
  users_id int [not null]
  sala varchar(100) [not null]
  imagem_url varchar(255)
}

Ref: funcoesUser.users_id > users.id [delete: cascade, update: cascade]

Ref: mensagensForum.users_id > users.id [delete: cascade, update: cascade]











