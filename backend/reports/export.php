<?php
// backend/reports/export.php — Enhanced CSV export with summary

require_once __DIR__ . '/../helpers/auth_guard.php';
require_once __DIR__ . '/../config/database.php';

$start_date = $_GET['start_date'] ?? date('Y-m-01');
$end_date = $_GET['end_date'] ?? date('Y-m-d');
$format = $_GET['format'] ?? 'csv';

if (!in_array($format, ['csv', 'pdf'])) {
    json_error('Unsupported export format');
}

$db = get_db();

// Get user info
$userStmt = $db->prepare("SELECT full_name, email, currency_symbol FROM users WHERE id = ?");
$userStmt->execute([$userId]);
$userInfo = $userStmt->fetch();
$currency = $userInfo['currency_symbol'] ?? '$';
if ($format === 'pdf' && ($currency === '₵' || $currency === 'GH₵')) $currency = 'GH₵'; // Dompdf supports UTF-8 if configured

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

// Get Detail Transactions
$sql = "SELECT t.*, 
        CASE WHEN t.type = 'expense' THEN ec.name ELSE ic.name END as category_name,
        a.name as account_name
        FROM transactions t
        LEFT JOIN expense_categories ec ON t.type = 'expense' AND t.category_id = ec.id
        LEFT JOIN income_categories ic ON t.type = 'income' AND t.category_id = ic.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.user_id = ? AND t.transaction_date BETWEEN ? AND ?
        ORDER BY transaction_date ASC";

$stmt = $db->prepare($sql);
$stmt->execute([$userId, $start_date, $end_date]);
$transactions = $stmt->fetchAll();

if ($format === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="financial_report_' . $start_date . '_to_' . $end_date . '.csv"');
    
    $output = fopen('php://output', 'w');
    fputcsv($output, ['BORNGREAT ACCOUNTING — FINANCIAL REPORT']);
    fputcsv($output, ['Generated for:', $userInfo['full_name'], 'Email:', $userInfo['email']]);
    fputcsv($output, ['Period:', $start_date . ' to ' . $end_date]);
    fputcsv($output, []);
    
    fputcsv($output, ['═══════════ FINANCIAL SUMMARY ═══════════']);
    fputcsv($output, ['Total Income', $currency . number_format($totalIncome, 2)]);
    fputcsv($output, ['Total Expense', $currency . number_format($totalExpense, 2)]);
    fputcsv($output, ['Net Balance', $currency . number_format($balance, 2)]);
    fputcsv($output, ['Savings Rate', $savingsRate . '%']);
    fputcsv($output, []);
    
    fputcsv($output, ['═══════════ TRANSACTION DETAILS ═══════════']);
    fputcsv($output, ['Date', 'Type', 'Account', 'Category', 'Description', 'Amount']);
    foreach ($transactions as $row) {
        fputcsv($output, [
            date("l, F j, Y", strtotime($row['transaction_date'])),
            ucfirst($row['type']),
            $row['account_name'] ?? 'N/A',
            $row['category_name'],
            $row['description'],
            $currency . number_format($row['amount'], 2)
        ]);
    }
    fclose($output);
    exit;
} else if ($format === 'pdf') {
    require_once __DIR__ . '/../vendor/autoload.php';
    $dompdf = new \Dompdf\Dompdf();
    
    $html = "<html><head><style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1B1B2F; }
        h1 { color: #7c5dfa; text-align: center; }
        .header-table { width: 100%; margin-bottom: 20px; border-bottom: 1px solid #7c5dfa; padding-bottom: 10px; }
        .summary-box { background: #F4F6FA; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #7c5dfa; color: #fff; padding: 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #EAECEF; }
        .income { color: #26c986; font-weight: bold; }
        .expense { color: #ff914d; font-weight: bold; }
    </style></head><body>
        <h1>Borngreat Accounting</h1>
        <table class='header-table'>
            <tr><td><strong>Report For:</strong> {$userInfo['full_name']}</td><td align='right'><strong>Period:</strong> {$start_date} to {$end_date}</td></tr>
        </table>
        
        <div class='summary-box'>
            <h3>Financial Summary</h3>
            <table style='background: none;'>
                <tr><td>Total Income:</td><td class='income'>{$currency}" . number_format($totalIncome, 2) . "</td></tr>
                <tr><td>Total Expense:</td><td class='expense'>{$currency}" . number_format($totalExpense, 2) . "</td></tr>
                <tr><td>Net Balance:</td><td style='font-weight:bold;'>{$currency}" . number_format($balance, 2) . "</td></tr>
            </table>
        </div>
        
        <h3>Transaction Details</h3>
        <table>
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
            <tbody>";
    
    foreach ($transactions as $t) {
        $dateFmt = date("l, F j, Y", strtotime($t['transaction_date']));
        $class = $t['type'] === 'income' ? 'income' : 'expense';
        $prefix = $t['type'] === 'income' ? '+' : '-';
        $html .= "<tr>
            <td>{$dateFmt}</td>
            <td>{$t['category_name']}</td>
            <td>{$t['description']}</td>
            <td class='{$class}'>{$prefix}{$currency}" . number_format($t['amount'], 2) . "</td>
        </tr>";
    }
    
    if (empty($transactions)) {
        $html .= "<tr><td colspan='4' align='center'>No transactions found</td></tr>";
    }
    
    $html .= "</tbody></table></body></html>";
    
    $dompdf->loadHtml($html);
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();
    $dompdf->stream("financial_report_{$start_date}.pdf", ["Attachment" => true]);
    exit;
}
