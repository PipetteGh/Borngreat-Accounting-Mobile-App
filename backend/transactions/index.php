<?php
// backend/transactions/index.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';

$db = get_db();

$params = [$userId];
$where = ["t.user_id = ?"];

if (isset($_GET['type']) && in_array($_GET['type'], ['income', 'expense'])) {
    $where[] = "t.type = ?";
    $params[] = $_GET['type'];
}

if (isset($_GET['start_date']) && !empty($_GET['start_date'])) {
    $where[] = "t.transaction_date >= ?";
    $params[] = $_GET['start_date'];
}

if (isset($_GET['end_date']) && !empty($_GET['end_date'])) {
    $where[] = "t.transaction_date <= ?";
    $params[] = $_GET['end_date'];
}

if (isset($_GET['category_id']) && !empty($_GET['category_id'])) {
    $where[] = "t.category_id = ?";
    $params[] = $_GET['category_id'];
}

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
$offset = ($page - 1) * $limit;

$whereSql = implode(' AND ', $where);

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
        END as category_color,
        a.name as account_name,
        a.type as account_type
        FROM transactions t
        LEFT JOIN expense_categories ec ON t.type = 'expense' AND t.category_id = ec.id
        LEFT JOIN income_categories ic ON t.type = 'income' AND t.category_id = ic.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE $whereSql
        ORDER BY transaction_date DESC, created_at DESC
        LIMIT $limit OFFSET $offset";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$transactions = $stmt->fetchAll();

// Get total count for pagination
$countSql = "SELECT COUNT(*) FROM transactions t WHERE $whereSql";
$countStmt = $db->prepare($countSql);
// Re-bind params for count query (remove limit/offset params)
$countStmt->execute($params);
$total = $countStmt->fetchColumn();

json_success([
    'transactions' => $transactions,
    'pagination' => [
        'total' => (int)$total,
        'page' => $page,
        'limit' => $limit,
        'total_pages' => ceil($total / $limit)
    ]
]);
