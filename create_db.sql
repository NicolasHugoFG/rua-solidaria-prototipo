-- Check if database exists, if not, create it
CREATE DATABASE IF NOT EXISTS RuaSolidaria;

-- Use the MyDB database
USE RuaSolidaria;

-- Create tables (example)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS instituicoes(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    CNPJ VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS doacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    instituicao INT NOT NULL,
    valor INT NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (instituicao) REFERENCES instituicoes(id)
);
INSERT INTO users (id, name, email)
VALUES (1, 'Admin User', 'admin@example.com');

INSERT INTO instituicoes(id, name, email, CNPJ)
VALUES (1, 'Rua Solidaria', 'RuaSolidaria@gmail.com', "000000000000");
