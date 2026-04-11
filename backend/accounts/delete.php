<?php
// backend/accounts/delete.php

require_once __DIR__ . '/../helpers/auth_guard.php';
require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Account ID is required']);
    exit;
}

$db = get_db();

// Verify ownership
$stmt = $db->prepare("SELECT id FROM accounts WHERE id = ? AND user_id = ?");
$stmt->execute([$data['id'], $userId]);
if (!$stmt->fetch()) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized or account not found']);
    exit;
}

$stmt = $db->prepare("DELETE FROM accounts WHERE id = ? AND user_id = ?");
$stmt->execute([$data['id'], $userId]);

header('Content-Type: application/json');
echo json_encode(['message' => 'Account deleted successfully']);
