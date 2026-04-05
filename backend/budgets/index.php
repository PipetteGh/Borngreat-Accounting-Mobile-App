<?php
// backend/budgets/index.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';

$month_year = $_GET['month_year'] ?? date('Y-m'); // Default to current month
$db = get_db();

$sql = "SELECT 
            b.*,
            ec.name as category_name,
            ec.icon as category_icon,
            ec.color as category_color,
            (SELECT SUM(amount) 
             FROM transactions 
             WHERE user_id = ? 
             AND category_id = b.category_id 
             AND type = 'expense' 
             AND DATE_FORMAT(transaction_date, '%Y-%m') = ?) as actual_spend
        FROM budgets b
        JOIN expense_categories ec ON b.category_id = ec.id
        WHERE b.user_id = ? AND b.month_year = ?";

$stmt = $db->prepare($sql);
$stmt->execute([$userId, $month_year, $userId, $month_year]);
$budgets = $stmt->fetchAll();

$formattedBudgets = array_map(function($row) {
    $row['amount'] = (float)$row['amount'];
    $row['actual_spend'] = (float)($row['actual_spend'] ?? 0);
    return $row;
}, $budgets);

json_success(['budgets' => $formattedBudgets]);
