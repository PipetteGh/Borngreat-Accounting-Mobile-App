<?php
// backend/transactions/create.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/validate.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];

require_fields($data, ['type', 'amount', 'category_id', 'transaction_date']);

if (!in_array($data['type'], ['income', 'expense'])) {
    json_error('Invalid transaction type');
}

if (!validate_positive_number($data['amount'])) {
    json_error('Amount must be positive');
}

if (!validate_date($data['transaction_date'])) {
    json_error('Invalid transaction date format (Y-m-d)');
}

$db = get_db();

// Check if category exists for the given type
$categoryTable = ($data['type'] === 'expense') ? 'expense_categories' : 'income_categories';
$stmt = $db->prepare("SELECT id FROM $categoryTable WHERE id = ?");
$stmt->execute([$data['category_id']]);
if (!$stmt->fetch()) {
    json_error('Category not found for the specified type');
}

$sql = "INSERT INTO transactions (user_id, type, amount, category_id, description, transaction_date, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $db->prepare($sql);
$stmt->execute([
    $userId,
    $data['type'],
    $data['amount'],
    $data['category_id'],
    $data['description'] ?? null,
    $data['transaction_date'],
    $data['notes'] ?? null
]);

$newId = $db->lastInsertId();

// Fetch and return the new row with category info
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
$stmt->execute([$newId, $userId]);
$transaction = $stmt->fetch();

json_success([
    'message' => 'Transaction created successfully',
    'transaction' => $transaction
], 201);
