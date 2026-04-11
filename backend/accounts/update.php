<?php
// backend/accounts/update.php

require_once __DIR__ . '/../helpers/auth_guard.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/validate.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];

require_fields($data, ['id', 'name', 'type']);

$db = get_db();

// Verify ownership
$stmt = $db->prepare("SELECT id FROM accounts WHERE id = ? AND user_id = ?");
$stmt->execute([$data['id'], $userId]);
if (!$stmt->fetch()) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized or account not found']);
    exit;
}

$sql = "UPDATE accounts SET name = ?, type = ?, initial_balance = ? WHERE id = ? AND user_id = ?";
$stmt = $db->prepare($sql);
$stmt->execute([
    $data['name'],
    $data['type'],
    $data['initial_balance'] ?? 0.00,
    $data['id'],
    $userId
]);

$stmt = $db->prepare("SELECT * FROM accounts WHERE id = ?");
$stmt->execute([$data['id']]);
$account = $stmt->fetch();

header('Content-Type: application/json');
echo json_encode([
    'message' => 'Account updated successfully',
    'account' => $account
]);
