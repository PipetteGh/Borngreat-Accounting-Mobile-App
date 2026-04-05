<?php
// backend/auth/login.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validate.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];

require_fields($data, ['email', 'password']);

$db = get_db();

$stmt = $db->prepare("SELECT id, full_name, email, password_hash, currency_symbol FROM users WHERE email = ?");
$stmt->execute([$data['email']]);
$user = $stmt->fetch();

if (!$user || !password_verify($data['password'], $user['password_hash'])) {
    json_error('Invalid credentials', 401);
}

unset($user['password_hash']);
$token = jwt_generate($user['id']);

json_success([
    'message' => 'Logged in successfully',
    'user' => $user,
    'token' => $token
]);
