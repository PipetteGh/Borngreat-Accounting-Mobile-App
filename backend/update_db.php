<?php
// backend/update_db.php

require_once __DIR__ . '/config/database.php';

try {
    $db = get_db();

    // 1. Create accounts table
    $sql = "CREATE TABLE IF NOT EXISTS accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) DEFAULT 'Cash',
        initial_balance DECIMAL(15, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $db->exec($sql);
    echo "Accounts table created or already exists.\n";

    // 2. Add account_id to transactions table if it doesn't exist
    $result = $db->query("SHOW COLUMNS FROM transactions LIKE 'account_id'");
    if ($result->rowCount() == 0) {
        $sql = "ALTER TABLE transactions ADD COLUMN account_id INT AFTER user_id,
                ADD CONSTRAINT fk_transaction_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL";
        $db->exec($sql);
        echo "Added account_id to transactions table.\n";
    } else {
        echo "account_id already exists in transactions table.\n";
    }

    // 3. Create default accounts for existing users if they don't have any
    $stmt = $db->query("SELECT id FROM users");
    $users = $stmt->fetchAll();

    foreach ($users as $user) {
        $userId = $user['id'];
        $checkStmt = $db->prepare("SELECT id FROM accounts WHERE user_id = ? LIMIT 1");
        $checkStmt->execute([$userId]);
        if ($checkStmt->rowCount() == 0) {
            $insertStmt = $db->prepare("INSERT INTO accounts (user_id, name, type, initial_balance) VALUES (?, 'General Account', 'Cash', 0.00)");
            $insertStmt->execute([$userId]);
            $accountId = $db->lastInsertId();
            
            // Link existing transactions to this new default account
            $updateStmt = $db->prepare("UPDATE transactions SET account_id = ? WHERE user_id = ? AND account_id IS NULL");
            $updateStmt->execute([$accountId, $userId]);
            echo "Created default account for User ID: $userId and linked existing transactions.\n";
        }
    }

    // 4. Sync Categories
    $expense_categories = [
        ['id' => 1, 'name' => 'Food & Drinks', 'icon' => 'fast-food'],
        ['id' => 2, 'name' => 'Transportation', 'icon' => 'car'],
        ['id' => 3, 'name' => 'Housing', 'icon' => 'home'],
        ['id' => 4, 'name' => 'Utilities', 'icon' => 'flash'],
        ['id' => 5, 'name' => 'Entertainment', 'icon' => 'play-circle'],
        ['id' => 6, 'name' => 'Shopping', 'icon' => 'cart'],
        ['id' => 7, 'name' => 'Health', 'icon' => 'medical'],
        ['id' => 8, 'name' => 'Education', 'icon' => 'book'],
        ['id' => 9, 'name' => 'Personal Care', 'icon' => 'brush'],
        ['id' => 10, 'name' => 'Gifts', 'icon' => 'gift'],
        ['id' => 11, 'name' => 'Travel', 'icon' => 'airplane'],
        ['id' => 12, 'name' => 'Others', 'icon' => 'ellipsis-horizontal'],
        ['id' => 13, 'name' => 'Family & Childcare', 'icon' => 'people'],
        ['id' => 14, 'name' => 'Family Support', 'icon' => 'heart'],
        ['id' => 15, 'name' => 'Subscriptions', 'icon' => 'albums'],
        ['id' => 16, 'name' => 'Insurance', 'icon' => 'shield-checkmark'],
        ['id' => 17, 'name' => 'Taxes', 'icon' => 'document-text'],
        ['id' => 18, 'name' => 'Debt Repayment', 'icon' => 'cash'],
        ['id' => 19, 'name' => 'Investments', 'icon' => 'trending-up'],
        ['id' => 20, 'name' => 'Savings', 'icon' => 'wallet'],
        ['id' => 21, 'name' => 'Donations & Charity', 'icon' => 'hand-left'],
        ['id' => 22, 'name' => 'Communication', 'icon' => 'call'],
        ['id' => 23, 'name' => 'Clothing', 'icon' => 'shirt']
    ];

    $income_categories = [
        ['id' => 1, 'name' => 'Salary', 'icon' => 'cash'],
        ['id' => 2, 'name' => 'Freelance', 'icon' => 'laptop'],
        ['id' => 3, 'name' => 'Investments', 'icon' => 'trending-up'],
        ['id' => 4, 'name' => 'Gifts', 'icon' => 'gift'],
        ['id' => 5, 'name' => 'Rental', 'icon' => 'key'],
        ['id' => 6, 'name' => 'Others', 'icon' => 'ellipsis-horizontal'],
        ['id' => 7, 'name' => 'Side Hustle', 'icon' => 'briefcase'],
        ['id' => 8, 'name' => 'Dividends', 'icon' => 'pie-chart'],
        ['id' => 9, 'name' => 'Refunds', 'icon' => 'return-up-back'],
        ['id' => 10, 'name' => 'Awards/Grants', 'icon' => 'medal'],
        ['id' => 14, 'name' => 'Business Income', 'icon' => 'storefront'],
        ['id' => 15, 'name' => 'Allowance', 'icon' => 'card'],
        ['id' => 16, 'name' => 'Savings Interest', 'icon' => 'analytics']
    ];

    foreach ($expense_categories as $cat) {
        $stmt = $db->prepare("INSERT INTO expense_categories (id, name, icon, color) VALUES (?, ?, ?, '#ffffff') ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon)");
        $stmt->execute([$cat['id'], $cat['name'], $cat['icon']]);
    }

    foreach ($income_categories as $cat) {
        $stmt = $db->prepare("INSERT INTO income_categories (id, name, icon, color) VALUES (?, ?, ?, '#ffffff') ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon)");
        $stmt->execute([$cat['id'], $cat['name'], $cat['icon']]);
    }

    echo "Categories synchronized successfully.\n";
    echo "Database update completed successfully.\n";

} catch (PDOException $e) {
    die("Error updating database: " . $e->getMessage() . "\n");
}
