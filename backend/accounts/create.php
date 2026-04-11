<?php
// backend/accounts/create.php

require_once __DIR__ . '/../helpers/auth_guard.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/validate.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];

require_fields($data, ['name', 'type']);

$db = get_db();

$sql = "INSERT INTO accounts (user_id, name, type, initial_balance) VALUES (?, ?, ?, ?)";
$stmt = $db->prepare($sql);
$stmt->execute([
    $userId,
    $data['name'],
    $data['type'],
    $data['initial_balance'] ?? 0.00
]);

$newId = $db->lastInsertId();

$stmt = $db->prepare("SELECT * FROM accounts WHERE id = ?");
$stmt->execute([$newId]);
$account = $stmt->fetch();

header('Content-Type: application/json');
http_response_code(201);
echo json_encode([
    'message' => 'Account created successfully',
    'account' => $account
]);
