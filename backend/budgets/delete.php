<?php
// backend/budgets/delete.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';

if (!$routeId) {
    json_error('Budget ID missing');
}

$db = get_db();

// Check ownership first
$stmt = $db->prepare("SELECT id FROM budgets WHERE id = ? AND user_id = ?");
$stmt->execute([$routeId, $userId]);
$transaction = $stmt->fetch();
if (!$transaction) {
    json_error('Budget not found or access denied', 404);
}

$stmt = $db->prepare("DELETE FROM budgets WHERE id = ? AND user_id = ?");
$stmt->execute([$routeId, $userId]);

json_success(['message' => 'Budget deleted successfully', 'deleted' => true]);
