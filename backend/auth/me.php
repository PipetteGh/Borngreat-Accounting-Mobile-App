<?php
// backend/auth/me.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';

$db = get_db();
$stmt = $db->prepare("SELECT id, full_name, email, currency_symbol, created_at FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    json_error('User not found', 404);
}

json_success(['user' => $user]);
