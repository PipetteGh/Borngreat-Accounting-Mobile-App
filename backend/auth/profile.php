<?php
// backend/auth/profile.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/validate.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$db = get_db();

if (isset($data['full_name']) || isset($data['currency_symbol'])) {
    $updates = [];
    $params = [];

    if (isset($data['full_name'])) {
        $updates[] = "full_name = ?";
        $params[] = $data['full_name'];
    }

    if (isset($data['currency_symbol'])) {
        $updates[] = "currency_symbol = ?";
        $params[] = $data['currency_symbol'];
    }

    if (!empty($updates)) {
        $params[] = $userId;
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
    }
}

// Return updated user
$stmt = $db->prepare("SELECT id, full_name, email, currency_symbol FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

json_success(['message' => 'Profile updated successfully', 'user' => $user]);
