CREATE TABLE IF NOT EXISTS userType(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS logs(
    id INT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(155) NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS accountType(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS profile(
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL,
    picture VARCHAR(200),
    email_publico VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS account(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    tipo INT NOT NULL,
    id_outro INT NOT NULL,
    FOREIGN KEY (tipo) REFERENCES accountType(id)
);

CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    show_donations TINYINT(1) DEFAULT 1,
    tipo INT NOT NULL,
    profile_id INT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profile(id)
);

CREATE TABLE IF NOT EXISTS instituicoes(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    cnpj VARCHAR(100) NOT NULL UNIQUE,
    link VARCHAR(100), 
    profile_id INT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profile(id)
);

CREATE TABLE IF NOT EXISTS doacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    anonymous TINYINT(1) DEFAULT 0,
    instituicao_id INT NOT NULL,
    valor DOUBLE NOT NULL,
    message VARCHAR(255),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id)
);

-- CREATE TABLE IF NOT EXISTS sessions(
--     id PRIMARY KEY,
--     user_id INT NOT NULL,
--     created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );

INSERT INTO userType(name)
VALUES ("usuario"), ("admin");

INSERT INTO accountType(name)
VALUES ("usuario"), ("instituicao");

INSERT INTO profile(description, picture, email_publico)
VALUES ("eu sou o admin", "/default.png", "");

INSERT INTO profile(description, picture, email_publico)
VALUES ("A Rua Solidária é uma ponte entre o coração de quem quer ajudar e as mãos que mais precisam. Somos uma instituição dedicada a coletar e distribuir doações de forma transparente e eficiente — tanto para outras organizações comprometidas com o bem, quanto para nossas próprias ações sociais.
", "/LogoRuaSolidariaPNG.png", "rua_solidaria@ulife.org.br");



INSERT INTO profile(description, picture, email_publico)
VALUES ("O Instituto Ramacrisna transforma vidas há décadas, oferecendo educação, cultura e oportunidades reais para crianças e jovens em situação de vulnerabilidade", "/ramacrisna.png", "faleconosco@ramacrisna.org.br");

INSERT INTO profile(description, picture, email_publico)
VALUES ("A Fundação Pão dos Pobres acolhe, forma e prepara adolescentes para o futuro, com afeto e estrutura.", "/pao_dos_pobres.png", "relacaoinstitucional@paodospobres.com.br");

INSERT INTO users(name, tipo, profile_id)
VALUES ("Joao guilherme", 2, 1);

INSERT INTO account (id, username, email, password, tipo, id_outro)
VALUES (1, 'Admin_User', 'admin@example.com', "senha", 1, LAST_INSERT_ID());

INSERT INTO instituicoes(name, cnpj, link, profile_id)
VALUES ("Rua Solidaria", "000000000002", "https://rua-solidaria.org.br/", 2);

INSERT INTO account(username, password, email, tipo, id_outro)
VALUES ("Rua-Solidaria", "senha", 'rua_solidaria@ulife.org.br', 2, LAST_INSERT_ID());

INSERT INTO instituicoes(name, cnpj, link, profile_id)
VALUES ("institutio ramacrisna", "000000000000", "https://ramacrisna.org.br/", 3);

INSERT INTO account(username, password, email, tipo, id_outro)
VALUES ("ramacrisna", "senha", 'faleconosco@ramacrisna.org.br', 2, LAST_INSERT_ID());

INSERT INTO instituicoes(name, cnpj, link, profile_id)
VALUES ("pao dos pobres", "000000000001","https://www.paodospobres.org.br/", 4);

INSERT INTO account(username, password, email, tipo, id_outro)
VALUES ("pao_dos_pobres", "senha", "relacaoinstitucional@paodospobres.com.br", 2, LAST_INSERT_ID());

INSERT INTO doacoes(user_id, instituicao_id, valor)
VALUES (1, 1, 0.75);



