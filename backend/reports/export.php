<?php
// backend/reports/export.php — Enhanced CSV export with summary

require_once __DIR__ . '/../helpers/auth_guard.php';
require_once __DIR__ . '/../config/database.php';

$start_date = $_GET['start_date'] ?? date('Y-m-01');
$end_date = $_GET['end_date'] ?? date('Y-m-d');
$format = $_GET['format'] ?? 'csv';

if ($format !== 'csv') {
    json_error('Unsupported export format');
}

$db = get_db();

// Get user info
$userStmt = $db->prepare("SELECT full_name, email, currency_symbol FROM users WHERE id = ?");
$userStmt->execute([$userId]);
$userInfo = $userStmt->fetch();
$currency = $userInfo['currency_symbol'] ?? '$';

// Get summary
$summSql = "SELECT 
    SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total_expense,
    COUNT(*) as transaction_count
    FROM transactions WHERE user_id = ? AND transaction_date BETWEEN ? AND ?";
$summStmt = $db->prepare($summSql);
$summStmt->execute([$userId, $start_date, $end_date]);
$summ = $summStmt->fetch();
$totalIncome = (float)($summ['total_income'] ?? 0);
$totalExpense = (float)($summ['total_expense'] ?? 0);
$balance = $totalIncome - $totalExpense;
$savingsRate = $totalIncome > 0 ? round(($balance / $totalIncome) * 100, 1) : 0;

// Get category breakdowns
$catSql = "SELECT t.type, 
    CASE WHEN t.type='expense' THEN ec.name ELSE ic.name END as category_name,
    SUM(t.amount) as cat_total, COUNT(*) as cat_count
    FROM transactions t
    LEFT JOIN expense_categories ec ON t.type='expense' AND t.category_id = ec.id
    LEFT JOIN income_categories ic ON t.type='income' AND t.category_id = ic.id
    WHERE t.user_id = ? AND t.transaction_date BETWEEN ? AND ?
    GROUP BY t.type, category_name ORDER BY t.type, cat_total DESC";
$catStmt = $db->prepare($catSql);
$catStmt->execute([$userId, $start_date, $end_date]);
$categories = $catStmt->fetchAll();

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="financial_report_' . $start_date . '_to_' . $end_date . '.csv"');

$output = fopen('php://output', 'w');

// Report Header
fputcsv($output, ['BORNGREAT ACCOUNTING — FINANCIAL REPORT']);
fputcsv($output, ['Generated for:', $userInfo['full_name'], 'Email:', $userInfo['email']]);
fputcsv($output, ['Period:', $start_date . ' to ' . $end_date]);
fputcsv($output, []);

// Summary Section
fputcsv($output, ['═══════════ FINANCIAL SUMMARY ═══════════']);
fputcsv($output, ['Total Income', $currency . number_format($totalIncome, 2)]);
fputcsv($output, ['Total Expense', $currency . number_format($totalExpense, 2)]);
fputcsv($output, ['Net Balance', $currency . number_format($balance, 2)]);
fputcsv($output, ['Savings Rate', $savingsRate . '%']);
fputcsv($output, ['Total Transactions', $summ['transaction_count']]);
$days = max(1, (strtotime($end_date) - strtotime($start_date)) / 86400);
fputcsv($output, ['Avg. Daily Expense', $currency . number_format($totalExpense / $days, 2)]);
fputcsv($output, ['Avg. Daily Income', $currency . number_format($totalIncome / $days, 2)]);
fputcsv($output, []);

// Category Breakdown
fputcsv($output, ['═══════════ EXPENSE BREAKDOWN ═══════════']);
fputcsv($output, ['Category', 'Total', 'Transactions', '% of Total']);
foreach ($categories as $cat) {
    if ($cat['type'] === 'expense') {
        $pct = $totalExpense > 0 ? round(($cat['cat_total'] / $totalExpense) * 100, 1) : 0;
        fputcsv($output, [$cat['category_name'], $currency . number_format($cat['cat_total'], 2), $cat['cat_count'], $pct . '%']);
    }
}
fputcsv($output, []);

fputcsv($output, ['═══════════ INCOME BREAKDOWN ═══════════']);
fputcsv($output, ['Category', 'Total', 'Transactions', '% of Total']);
foreach ($categories as $cat) {
    if ($cat['type'] === 'income') {
        $pct = $totalIncome > 0 ? round(($cat['cat_total'] / $totalIncome) * 100, 1) : 0;
        fputcsv($output, [$cat['category_name'], $currency . number_format($cat['cat_total'], 2), $cat['cat_count'], $pct . '%']);
    }
}
fputcsv($output, []);

// Transaction Detail
fputcsv($output, ['═══════════ TRANSACTION DETAILS ═══════════']);
fputcsv($output, ['Date', 'Type', 'Category', 'Description', 'Amount', 'Notes']);

$sql = "SELECT t.*, 
        CASE WHEN t.type = 'expense' THEN ec.name ELSE ic.name END as category_name
        FROM transactions t
        LEFT JOIN expense_categories ec ON t.type = 'expense' AND t.category_id = ec.id
        LEFT JOIN income_categories ic ON t.type = 'income' AND t.category_id = ic.id
        WHERE t.user_id = ? AND t.transaction_date BETWEEN ? AND ?
        ORDER BY transaction_date ASC";

$stmt = $db->prepare($sql);
$stmt->execute([$userId, $start_date, $end_date]);

while ($row = $stmt->fetch()) {
    fputcsv($output, [
        $row['transaction_date'],
        ucfirst($row['type']),
        $row['category_name'],
        $row['description'],
        $currency . number_format($row['amount'], 2),
        $row['notes']
    ]);
}

fclose($output);
exit;
