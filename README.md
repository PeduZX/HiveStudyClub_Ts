# PI---PROJETO-INTEGRADOR

<img width="1048" height="270" alt="image" src="https://github.com/user-attachments/assets/28f52369-cb2e-48c4-98b8-b12d582a0c8d" />

## npm i express nodemon dotenv multer bcrypt jsonwebtoken mysql2 cors



CREATE DATABASE bancoPI;
USE bancoPI;


CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  data_nasc DATE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  pontos INT DEFAULT 0
  );


CREATE TABLE mentorar (	
  id_area_mentorar INT  PRIMARY KEY AUTO_INCREMENT,
  nomeAreaMentorar VARCHAR(100) NOT NULL,
  users_id INT,
	FOREIGN KEY (users_id) REFERENCES users (id)
);


CREATE TABLE mentorado (
  id_area_mentorado INT  PRIMARY KEY AUTO_INCREMENT,
  nomeAreaMentorado VARCHAR(100) NOT NULL,
  users_id INT ,
    FOREIGN KEY (users_id) REFERENCES users (id)
);


CREATE TABLE mensagens (
  id_mensagens  INT PRIMARY KEY NOT NULL,
  data_envio DATETIME NOT NULL,
  users_id INT NOT NULL,
    FOREIGN KEY (users_id) REFERENCES users (id)
);




SELECT * FROM users;
SELECT * FROM mentorar;
SELECT * FROM mentorado;


DROP TABLE mentorado;
DROP TABLE mentorar;
drop database bancoPI;






<img width="500" height="45" alt="image" src="https://github.com/user-attachments/assets/68c28440-aca2-429a-90da-c87dd13f6b27" />














