<?php
// backend/dashboard/breakdown.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';

$period = $_GET['period'] ?? 'monthly';
$type = $_GET['type'] ?? 'expense'; // expense or income
$db = get_db();

$period_start = null;
$period_end = date('Y-m-d');

if ($period === 'custom') {
    $period_start = $_GET['start_date'] ?? date('Y-m-01');
    $period_end = $_GET['end_date'] ?? date('Y-m-d');
} elseif ($period === 'weekly') {
    $period_start = date('Y-m-d', strtotime('-7 days'));
} elseif ($period === 'yearly') {
    $period_start = date('Y-01-01');
} elseif ($period === 'quarterly') {
    $month = date('n');
    $quarterStart = (int)(ceil($month / 3) - 1) * 3 + 1;
    $period_start = date('Y') . '-' . str_pad($quarterStart, 2, '0', STR_PAD_LEFT) . '-01';
} else {
    $period_start = date('Y-m-01');
}

// Get total for the type
$totalSql = "SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = ? AND transaction_date BETWEEN ? AND ?";
$stmt = $db->prepare($totalSql);
$stmt->execute([$userId, $type, $period_start, $period_end]);
$totalAmount = (float)$stmt->fetchColumn();

if ($totalAmount == 0) {
    json_success(['breakdown' => []]);
}

$categoryTable = ($type === 'expense') ? 'expense_categories' : 'income_categories';

$sql = "SELECT 
            t.category_id,
            c.name as category_name,
            c.icon as category_icon,
            c.color as category_color,
            SUM(t.amount) as category_total
        FROM transactions t
        JOIN $categoryTable c ON t.category_id = c.id
        WHERE t.user_id = ? AND t.type = ? AND t.transaction_date BETWEEN ? AND ?
        GROUP BY t.category_id
        ORDER BY category_total DESC";

$stmt = $db->prepare($sql);
$stmt->execute([$userId, $type, $period_start, $period_end]);
$results = $stmt->fetchAll();

$breakdown = array_map(function($row) use ($totalAmount) {
    $row['category_total'] = (float)$row['category_total'];
    $row['percentage'] = round(($row['category_total'] / $totalAmount) * 100, 2);
    return $row;
}, $results);

json_success(['breakdown' => $breakdown]);
