<?php
// backend/budgets/upsert.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/validate.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];

require_fields($data, ['category_id', 'amount', 'month_year']);

if (!validate_positive_number($data['amount'])) {
    json_error('Amount must be positive');
}

// Basic format check: YYYY-MM
if (!preg_match('/^\d{4}-\d{2}$/', $data['month_year'])) {
    json_error('Invalid month_year format (YYYY-MM)');
}

$db = get_db();

// Check if category exists
$stmt = $db->prepare("SELECT id FROM expense_categories WHERE id = ?");
$stmt->execute([$data['category_id']]);
if (!$stmt->fetch()) {
    json_error('Expense category not found');
}

$sql = "INSERT INTO budgets (user_id, category_id, amount, month_year) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE amount = VALUES(amount)";

$stmt = $db->prepare($sql);
$stmt->execute([$userId, $data['category_id'], $data['amount'], $data['month_year']]);

json_success(['message' => 'Budget set successfully']);
