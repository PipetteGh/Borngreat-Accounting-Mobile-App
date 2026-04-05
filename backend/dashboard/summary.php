<?php
// backend/dashboard/summary.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';

$period = $_GET['period'] ?? 'monthly'; // weekly, monthly, yearly
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
} else { // monthly
    $period_start = date('Y-m-01');
}

$sql = "SELECT 
            SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total_expense,
            COUNT(*) as transaction_count
        FROM transactions 
        WHERE user_id = ? AND transaction_date BETWEEN ? AND ?";

$stmt = $db->prepare($sql);
$stmt->execute([$userId, $period_start, $period_end]);
$summary = $stmt->fetch();

$total_income = (float)($summary['total_income'] ?? 0);
$total_expense = (float)($summary['total_expense'] ?? 0);

$stmtUnread = $db->prepare("SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0");
$stmtUnread->execute([$userId]);
$unreadCount = (int)($stmtUnread->fetch()['unread'] ?? 0);

json_success([
    'total_income' => $total_income,
    'total_expense' => $total_expense,
    'balance' => $total_income - $total_expense,
    'transaction_count' => (int)$summary['transaction_count'],
    'period_start' => $period_start,
    'period_end' => $period_end,
    'unread_notifications' => $unreadCount
]);
