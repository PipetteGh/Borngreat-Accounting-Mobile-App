<?php
// backend/accounts/index.php

require_once __DIR__ . '/../helpers/auth_guard.php'; // sets $userId
require_once __DIR__ . '/../config/database.php';

try {
    $db = get_db();

    // Fetch accounts with calculated balances: initial_balance + incomes - expenses
    $sql = "SELECT a.*,
            (a.initial_balance + 
             COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND type = 'income'), 0) - 
             COALESCE((SELECT SUM(amount) FROM transactions WHERE account_id = a.id AND type = 'expense'), 0)
            ) as current_balance
            FROM accounts a
            WHERE a.user_id = ?
            ORDER BY a.name ASC";

    $stmt = $db->prepare($sql);
    $stmt->execute([$userId]);
    $accounts = $stmt->fetchAll();

    header('Content-Type: application/json');
    echo json_encode(['accounts' => $accounts]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
