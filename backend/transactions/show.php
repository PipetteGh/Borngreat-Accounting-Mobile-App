<?php
// backend/transactions/show.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';

$db = get_db();

if (!$routeId) {
    json_error('Transaction ID missing');
}

$sql = "SELECT t.*, 
        CASE 
            WHEN t.type = 'expense' THEN ec.name 
            ELSE ic.name 
        END as category_name,
        CASE 
            WHEN t.type = 'expense' THEN ec.icon 
            ELSE ic.icon 
        END as category_icon,
        CASE 
            WHEN t.type = 'expense' THEN ec.color 
            ELSE ic.color 
        END as category_color
        FROM transactions t
        LEFT JOIN expense_categories ec ON t.type = 'expense' AND t.category_id = ec.id
        LEFT JOIN income_categories ic ON t.type = 'income' AND t.category_id = ic.id
        WHERE t.id = ? AND t.user_id = ?";

$stmt = $db->prepare($sql);
$stmt->execute([$routeId, $userId]);
$transaction = $stmt->fetch();

if (!$transaction) {
    json_error('Transaction not found or access denied', 404);
}

json_success(['transaction' => $transaction]);
