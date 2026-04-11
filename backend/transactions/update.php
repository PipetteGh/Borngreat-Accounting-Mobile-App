<?php
// backend/transactions/update.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/validate.php';

if (!$routeId) {
    json_error('Transaction ID missing');
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$db = get_db();

// Check ownership first
$stmt = $db->prepare("SELECT id, type FROM transactions WHERE id = ? AND user_id = ?");
$stmt->execute([$routeId, $userId]);
$existing = $stmt->fetch();
if (!$existing) {
    json_error('Transaction not found or access denied', 404);
}

$allowedFields = ['amount', 'category_id', 'description', 'transaction_date', 'notes', 'account_id'];
$updates = [];
$params = [];

foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        // Validation if provided
        if ($field === 'amount' && !validate_positive_number($data[$field])) {
            json_error('Amount must be positive');
        }
        if ($field === 'transaction_date' && !validate_date($data[$field])) {
            json_error('Invalid transaction date format (Y-m-d)');
        }
        if ($field === 'account_id') {
            // Check if account exists and belongs to user
            $accStmt = $db->prepare("SELECT id FROM accounts WHERE id = ? AND user_id = ?");
            $accStmt->execute([$data['account_id'], $userId]);
            if (!$accStmt->fetch()) {
                json_error('Account not found or unauthorized');
            }
        }
        if ($field === 'category_id') {
             // Check if category exists for the current transaction type
             $categoryTable = ($existing['type'] === 'expense') ? 'expense_categories' : 'income_categories';
             $chkStmt = $db->prepare("SELECT id FROM $categoryTable WHERE id = ?");
             $chkStmt->execute([$data['category_id']]);
             if (!$chkStmt->fetch()) {
                 json_error('Category not found for the current transaction type');
             }
        }
        
        $updates[] = "$field = ?";
        $params[] = $data[$field];
    }
}

if (!empty($updates)) {
    $params[] = $routeId;
    $params[] = $userId;
    $sql = "UPDATE transactions SET " . implode(', ', $updates) . " WHERE id = ? AND user_id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
}

// Fetch and return the updated row
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

json_success([
    'message' => 'Transaction updated successfully',
    'transaction' => $transaction
]);
