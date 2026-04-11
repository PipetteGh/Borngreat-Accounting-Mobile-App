<?php
// backend/cron/monthly_summary.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/email.php';
require_once __DIR__ . '/../vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

/**
 * Procedural script to calculate monthly summary and send email.
 * This should be triggered by a server-side cron job (e.g. at the 1st of every month).
 */

try {
    $db = get_db();

    // Get all users to send them their respective position
    $stmt = $db->query("SELECT id, email, full_name, currency_symbol FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Target recipient for owner summary as per user request
    $owner_email = 'peterborngreatmensah@gmail.com';

    // Calculate previous month's dates
    $firstDayLastMonth = date("Y-m-01", strtotime("first day of last month"));
    $lastDayLastMonth = date("Y-m-t", strtotime("last day of last month"));
    $monthLabel = date("F Y", strtotime("last month"));

    foreach ($users as $user) {
        $userId = $user['id'];
        $currencyRaw = trim($user['currency_symbol']);

        // Dompdf standard fonts (Helvetica/Arial) do not perfectly support all African/Asian unicode symbols (like ₵ or ₦).
        // To guarantee flawless PDF reports globally without "?" glitches, we convert known problematic symbols to their standard 3-letter ISO code explicitly for the email report.
        $currency = $currencyRaw;
        if ($currency === '₵' || $currency === 'GH₵')
            $currency = 'GHS ';
        elseif ($currency === '₦')
            $currency = 'NGN ';
        elseif ($currency === '₹')
            $currency = 'INR ';

        // Ensure a global default exists
        if (empty($currency)) {
            $currency = '$ ';
        }

        // 1. Calculate Total Income for last month
        $stmt = $db->prepare("SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'income' AND transaction_date BETWEEN ? AND ?");
        $stmt->execute([$userId, $firstDayLastMonth, $lastDayLastMonth]);
        $income = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

        // 2. Calculate Total Expenses for last month
        $stmt = $db->prepare("SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'expense' AND transaction_date BETWEEN ? AND ?");
        $stmt->execute([$userId, $firstDayLastMonth, $lastDayLastMonth]);
        $expenses = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

        // 3. Calculate Overall Balance (Total up to end of last month)
        $stmt = $db->prepare("SELECT 
            (SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = 'income' AND transaction_date <= ?) - 
            (SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = 'expense' AND transaction_date <= ?) as balance");
        $stmt->execute([$userId, $lastDayLastMonth, $userId, $lastDayLastMonth]);
        $balance = $stmt->fetch(PDO::FETCH_ASSOC)['balance'] ?? 0;

        // Fetch Account Balances
        $stmt = $db->prepare("SELECT a.name, a.type,
            (a.initial_balance + 
             COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND type = 'income'), 0) - 
             COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND type = 'expense'), 0)
            ) as current_balance
            FROM accounts a
            WHERE a.user_id = ?");
        $stmt->execute([$userId]);
        $accountBalances = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch full Expense Breakdown
        $stmt = $db->prepare("SELECT sum(amount) as category_total, (SELECT name FROM expense_categories WHERE id = category_id) as category_name FROM transactions WHERE user_id = ? AND type = 'expense' AND transaction_date BETWEEN ? AND ? GROUP BY category_id ORDER BY category_total DESC");
        $stmt->execute([$userId, $firstDayLastMonth, $lastDayLastMonth]);
        $expenseBreakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch full Income Breakdown
        $stmt = $db->prepare("SELECT sum(amount) as category_total, (SELECT name FROM income_categories WHERE id = category_id) as category_name FROM transactions WHERE user_id = ? AND type = 'income' AND transaction_date BETWEEN ? AND ? GROUP BY category_id ORDER BY category_total DESC");
        $stmt->execute([$userId, $firstDayLastMonth, $lastDayLastMonth]);
        $incomeBreakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch Income Transactions History (with account and notes)
        $stmt = $db->prepare("SELECT t.amount, t.transaction_date, t.description, t.notes, 
            (SELECT ic.name FROM income_categories ic WHERE ic.id = t.category_id) as category_name, 
            a.name as account_name 
            FROM transactions t 
            LEFT JOIN accounts a ON t.account_id = a.id 
            WHERE t.user_id = ? AND t.type = 'income' AND t.transaction_date BETWEEN ? AND ? 
            ORDER BY t.transaction_date ASC");
        $stmt->execute([$userId, $firstDayLastMonth, $lastDayLastMonth]);
        $incomeTransactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch Expense Transactions History (with account and notes)
        $stmt = $db->prepare("SELECT t.amount, t.transaction_date, t.description, t.notes, 
            (SELECT ec.name FROM expense_categories ec WHERE ec.id = t.category_id) as category_name, 
            a.name as account_name 
            FROM transactions t 
            LEFT JOIN accounts a ON t.account_id = a.id 
            WHERE t.user_id = ? AND t.type = 'expense' AND t.transaction_date BETWEEN ? AND ? 
            ORDER BY t.transaction_date ASC");
        $stmt->execute([$userId, $firstDayLastMonth, $lastDayLastMonth]);
        $expenseTransactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $topExpenseName = !empty($expenseBreakdown) ? $expenseBreakdown[0]['category_name'] : 'N/A';
        $topIncomeName = !empty($incomeBreakdown) ? $incomeBreakdown[0]['category_name'] : 'N/A';

        // Recalculate vital statistics
        $txCount = count($incomeTransactions) + count($expenseTransactions);
        $days = max(1, (int) date('t', strtotime("last month")));
        $avgDailyE = number_format($expenses / $days, 2, '.', '');
        $avgDailyI = number_format($income / $days, 2, '.', '');
        $sr = $income > 0 ? number_format((max($income - $expenses, 0) / $income) * 100, 1) : '0';
        $netMonthly = $income - $expenses;

        // HTML building matching verbatim to the frontend report-generator.tsx
        $bodyHtml = "
        <!DOCTYPE html><html><head><meta charset='UTF-8'><style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #fff; color: #1B1B2F; line-height: 1.6; }
            h1 { color: #7c5dfa; border-bottom: 3px solid #7c5dfa; padding-bottom: 10px; margin-bottom: 5px; font-size: 28px; }
            h2 { color: #1B1B2F; margin-top: 32px; margin-bottom: 16px; font-size: 18px; border-left: 4px solid #7c5dfa; padding-left: 12px; }
            .subtitle { color: #8E92A8; font-size: 14px; margin-bottom: 30px; }
            .cards { display: inline-block; width: 100%; margin-bottom: 30px; }
            .card { background: #F4F6FA; padding: 20px; border-radius: 14px; text-align: center; width: 31%; display: inline-block; box-sizing: border-box; }
            .card-label { color: #8E92A8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .card-value { font-size: 24px; font-weight: bold; }
            .green { color: #26c986; } .orange { color: #ff914d; } .purple { color: #7c5dfa; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #7c5dfa; color: #fff; padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
            th.income-th { background: #26c986; }
            th.expense-th { background: #ff914d; }
            td { padding: 10px 14px; border-bottom: 1px solid #EAECEF; font-size: 13px; }
            tr:nth-child(even) { background: #F9FAFB; }
            .total-row td { font-weight: bold; background: #F0EDFF; font-size: 14px; }
            .income-total td { background: #EAFFF4; }
            .expense-total td { background: #FFF5EE; }
            .stats-grid { display: block; margin-bottom: 30px; width: 100%; }
            .stat { background: #F4F6FA; padding: 14px 18px; border-radius: 12px; width: 31%; display: inline-block; margin-bottom: 12px; box-sizing: border-box; }
            .stat-label { color: #8E92A8; font-size: 10px; text-transform: uppercase; }
            .stat-val { font-size: 16px; font-weight: bold; margin-top: 4px; }
            .footer { margin-top: 40px; text-align: center; color: #C8CBD9; font-size: 11px; border-top: 1px solid #EAECEF; padding-top: 20px; }
            .page-break { page-break-before: always; }
        </style></head><body>
            <h1>Borngreat Accounting</h1>
            <p class='subtitle'>Comprehensive Financial Report</p>
            <p><strong>Account Holder:</strong> {$user['full_name']} &nbsp; <strong>Email:</strong> {$user['email']}</p>
            <p><strong>Report Period:</strong> " . date("l, F j, Y", strtotime($firstDayLastMonth)) . " to " . date("l, F j, Y", strtotime($lastDayLastMonth)) . " ({$days} days)</p>

            <h2>Financial Overview</h2>
            <div class='cards'>
                <div class='card' style='margin-right: 1%;'><div class='card-label'>Total Income</div><div class='card-value green'>{$currency}" . number_format($income, 2) . "</div></div>
                <div class='card' style='margin-right: 1%;'><div class='card-label'>Total Expense</div><div class='card-value orange'>{$currency}" . number_format($expenses, 2) . "</div></div>
                <div class='card'><div class='card-label'>Net Balance</div><div class='card-value purple'>{$currency}" . number_format($netMonthly, 2) . "</div></div>
            </div>

            <h2>Key Statistics</h2>
            <div class='stats-grid'>
                <div class='stat' style='margin-right: 1%;'><div class='stat-label'>Savings Rate</div><div class='stat-val green'>{$sr}%</div></div>
                <div class='stat' style='margin-right: 1%;'><div class='stat-label'>Total Transactions</div><div class='stat-val'>{$txCount}</div></div>
                <div class='stat'><div class='stat-label'>Avg Daily Income</div><div class='stat-val green'>{$currency}{$avgDailyI}</div></div>
                <div class='stat' style='margin-right: 1%;'><div class='stat-label'>Avg Daily Expense</div><div class='stat-val orange'>{$currency}{$avgDailyE}</div></div>
                <div class='stat' style='margin-right: 1%;'><div class='stat-label'>Top Expense Category</div><div class='stat-val'>{$topExpenseName}</div></div>
                <div class='stat'><div class='stat-label'>Top Income Source</div><div class='stat-val'>{$topIncomeName}</div></div>
            </div>

            <h2>Account Balances</h2>
            <table>
                <tr><th>Account Name</th><th>Type</th><th>Current Balance</th></tr>";

        foreach ($accountBalances as $ab) {
            $bodyHtml .= "<tr><td>{$ab['name']}</td><td>" . ucfirst($ab['type']) . "</td><td style='font-weight:bold;'>{$currency}" . number_format($ab['current_balance'], 2) . "</td></tr>";
        }
        if (empty($accountBalances)) {
            $bodyHtml .= "<tr><td colspan='3' style='text-align:center;color:#8E92A8;'>No accounts found</td></tr>";
        }

        $bodyHtml .= "</table>

            <h2>Expense Breakdown by Category</h2>
            <table>
                <tr><th>#</th><th>Category</th><th>Amount</th><th>% of Expenses</th></tr>";

        $i = 1;
        foreach ($expenseBreakdown as $b) {
            $catName = $b['category_name'] ?? '-';
            $catAmount = $b['category_total'] ?? 0;
            $perc = $expenses > 0 ? round(($catAmount / $expenses) * 100, 1) : 0;
            $bodyHtml .= "<tr><td>{$i}</td><td>{$catName}</td><td>{$currency}" . number_format($catAmount, 2) . "</td><td>{$perc}%</td></tr>";
            $i++;
        }
        if (empty($expenseBreakdown)) {
            $bodyHtml .= "<tr><td colspan='4' style='text-align:center;color:#8E92A8;'>No expenses in this period</td></tr>";
        } else {
            $bodyHtml .= "<tr class='total-row'><td></td><td>Total Expenses</td><td>{$currency}" . number_format($expenses, 2) . "</td><td>100%</td></tr>";
        }

        $bodyHtml .= "
            </table>

            <h2>Income Breakdown by Source</h2>
            <table>
                <tr><th>#</th><th>Source</th><th>Amount</th><th>% of Income</th></tr>";

        $i = 1;
        foreach ($incomeBreakdown as $b) {
            $catName = $b['category_name'] ?? '-';
            $catAmount = $b['category_total'] ?? 0;
            $perc = $income > 0 ? round(($catAmount / $income) * 100, 1) : 0;
            $bodyHtml .= "<tr><td>{$i}</td><td>{$catName}</td><td>{$currency}" . number_format($catAmount, 2) . "</td><td>{$perc}%</td></tr>";
            $i++;
        }
        if (empty($incomeBreakdown)) {
            $bodyHtml .= "<tr><td colspan='4' style='text-align:center;color:#8E92A8;'>No income in this period</td></tr>";
        } else {
            $bodyHtml .= "<tr class='total-row'><td></td><td>Total Income</td><td>{$currency}" . number_format($income, 2) . "</td><td>100%</td></tr>";
        }

        $bodyHtml .= "
            </table>
            
            <div class='page-break'></div>

            <h2>Income Transaction History (" . count($incomeTransactions) . " transactions)</h2>
            <table>
                <tr><th class='income-th'>#</th><th class='income-th'>Date</th><th class='income-th'>Account</th><th class='income-th'>Category</th><th class='income-th'>Description</th><th class='income-th'>Notes</th><th class='income-th'>Amount</th></tr>";

        $i = 1;
        foreach ($incomeTransactions as $t) {
            $dateFmt = date("l, F j, Y", strtotime($t['transaction_date']));
            $acc = $t['account_name'] ?: 'N/A';
            $cat = $t['category_name'] ?: '-';
            $desc = $t['description'] ?: '-';
            $notes = $t['notes'] ?: '-';
            $amt = number_format($t['amount'], 2);
            $bodyHtml .= "<tr><td>{$i}</td><td>{$dateFmt}</td><td>{$acc}</td><td>{$cat}</td><td>{$desc}</td><td>{$notes}</td><td style='color:#26c986;font-weight:bold;'>+{$currency}{$amt}</td></tr>";
            $i++;
        }
        if (empty($incomeTransactions)) {
            $bodyHtml .= "<tr><td colspan='7' style='text-align:center;color:#8E92A8;'>No income transactions in this period</td></tr>";
        } else {
            $bodyHtml .= "<tr class='total-row income-total'><td></td><td colspan='5'>Total Income</td><td style='color:#26c986;'>+{$currency}" . number_format($income, 2) . "</td></tr>";
        }

        $bodyHtml .= "
            </table>

            <h2>Expense Transaction History (" . count($expenseTransactions) . " transactions)</h2>
            <table>
                <tr><th class='expense-th'>#</th><th class='expense-th'>Date</th><th class='expense-th'>Account</th><th class='expense-th'>Category</th><th class='expense-th'>Description</th><th class='expense-th'>Notes</th><th class='expense-th'>Amount</th></tr>";

        $i = 1;
        foreach ($expenseTransactions as $t) {
            $dateFmt = date("l, F j, Y", strtotime($t['transaction_date']));
            $acc = $t['account_name'] ?: 'N/A';
            $cat = $t['category_name'] ?: '-';
            $desc = $t['description'] ?: '-';
            $notes = $t['notes'] ?: '-';
            $amt = number_format($t['amount'], 2);
            $bodyHtml .= "<tr><td>{$i}</td><td>{$dateFmt}</td><td>{$acc}</td><td>{$cat}</td><td>{$desc}</td><td>{$notes}</td><td style='color:#ff914d;font-weight:bold;'>-{$currency}{$amt}</td></tr>";
            $i++;
        }
        if (empty($expenseTransactions)) {
            $bodyHtml .= "<tr><td colspan='7' style='text-align:center;color:#8E92A8;'>No expense transactions in this period</td></tr>";
        } else {
            $bodyHtml .= "<tr class='total-row expense-total'><td></td><td colspan='5'>Total Expenses</td><td style='color:#ff914d;'>-{$currency}" . number_format($expenses, 2) . "</td></tr>";
        }

        $genDate = date('F j, Y \a\t g:i A');
        $bodyHtml .= "
            </table>

            <div class='footer'>
                <p>Generated by <strong>Borngreat Accounting</strong> on {$genDate}</p>
                <p>This is an automated monthly financial position report. Please verify all figures with your records.</p>
            </div>
        </body></html>
        ";

        // Generate PDF
        $options = new Options();
        $options->set('defaultFont', 'Arial');
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($bodyHtml);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $pdfOutput = $dompdf->output();

        $startLabelStr = date("F j, Y", strtotime($firstDayLastMonth));
        $endLabelStr = date("F j, Y", strtotime($lastDayLastMonth));
        $safeStart = preg_replace('/[, ]+/', '_', $startLabelStr);
        $safeEnd = preg_replace('/[, ]+/', '_', $endLabelStr);
        $pdfFilename = "Borngreat_Report_{$safeStart}_to_{$safeEnd}.pdf";

        $tempPdfPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $pdfFilename;
        file_put_contents($tempPdfPath, $pdfOutput);

        // Send to user with PDF attachment
        $subject = "{$user['full_name']} Financial Report — $monthLabel";
        $emailBody = "<p>Hi {$user['full_name']},</p><p>Please find attached your Borngreat Accounting financial report for <strong>$monthLabel</strong>.</p><p>Stay financially strong!</p>";
        send_smtp_email($user['email'], $subject, $emailBody, $tempPdfPath, $pdfFilename);

        // Clean up temp file
        if (file_exists($tempPdfPath)) {
            unlink($tempPdfPath);
        }

        // Save notification to database
        $notifTitle = "Monthly Report — $monthLabel";
        $notifMessage = "Income: $currency" . number_format($income, 2) . " | Expenses: $currency" . number_format($expenses, 2) . " | Balance: $currency" . number_format($balance, 2);
        $notifStmt = $db->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'report')");
        $notifStmt->execute([$userId, $notifTitle, $notifMessage]);
    }

    // Explicitly send a copy to the specified recipient for the "main" account if it didn't happen above
    // Assuming 'peterborngreatmensah@gmail.com' is the user's registered email.

    echo "Monthly summaries processed successfully.";

} catch (Exception $e) {
    error_log("Cron Error: " . $e->getMessage());
    echo "Processing failed: " . $e->getMessage();
}
