<?php
// backend/dashboard/trend.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';

$period = $_GET['period'] ?? 'monthly';
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

$sql = "SELECT 
            transaction_date as date,
            SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
        FROM transactions 
        WHERE user_id = ? AND transaction_date BETWEEN ? AND ?
        GROUP BY DATE(transaction_date)
        ORDER BY date ASC";

$stmt = $db->prepare($sql);
$stmt->execute([$userId, $period_start, $period_end]);
$rawTrend = $stmt->fetchAll();

// Build a lookup of actual data
$dataByDate = [];
foreach ($rawTrend as $row) {
    $dataByDate[$row['date']] = [
        'income' => (float)$row['income'],
        'expense' => (float)$row['expense']
    ];
}

// Fill in ALL dates in the range so charts always have data points
$formattedTrend = [];
$current = new DateTime($period_start);
$end = new DateTime($period_end);

while ($current <= $end) {
    $d = $current->format('Y-m-d');
    $formattedTrend[] = [
        'date' => $d,
        'income' => isset($dataByDate[$d]) ? $dataByDate[$d]['income'] : 0,
        'expense' => isset($dataByDate[$d]) ? $dataByDate[$d]['expense'] : 0
    ];
    $current->modify('+1 day');
}

json_success(['trend' => $formattedTrend]);
