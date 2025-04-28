<?php

$data = json_decode(file_get_contents('php://input'), true);

$valor = $data['valor'] ?? null;

if ($valor === null) {
    http_response_code(400);
    echo "Valor não recebido.";
    exit;
}

$host = 'localhost';
$db   = 'rua_solidaria';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$mysqli = new mysqli($host, $user, $pass, $db);

if ($mysqli->connect_errno) {
    http_response_code(500);
    echo "Erro de conexão: " . $mysqli->connect_error;
    exit;
}

$stmt = $mysqli->prepare("INSERT INTO doacoes (valor) VALUES (?)");
$stmt->bind_param("d", $valor);

if ($stmt->execute()) {
    echo "Doação registrada!";
} else {
    http_response_code(500);
    echo "Erro ao registrar a doação.";
}

$stmt->close();
$mysqli->close();
?>
