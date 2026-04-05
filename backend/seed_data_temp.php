<?php
require_once __DIR__ . '/config/database.php';

try {
    $pdo = get_db();
    
    // Disable FK checks and clear existing data
    $pdo->exec("SET FOREIGN_KEY_CHECKS=0");
    $pdo->exec("DELETE FROM expense_categories");
    $pdo->exec("ALTER TABLE expense_categories AUTO_INCREMENT = 1");
    $pdo->exec("DELETE FROM income_categories");
    $pdo->exec("ALTER TABLE income_categories AUTO_INCREMENT = 1");
    
    // Insert expense categories
    $pdo->exec("INSERT INTO expense_categories (name, icon, color, sort_order) VALUES
    ('Food & Drinks', 'fast-food', '#ffffff', 1),
    ('Transportation', 'car', '#ffffff', 2),
    ('Housing', 'home', '#ffffff', 3),
    ('Utilities', 'flash', '#ffffff', 4),
    ('Entertainment', 'play-circle', '#ffffff', 5),
    ('Shopping', 'cart', '#ffffff', 6),
    ('Health', 'medical', '#ffffff', 7),
    ('Education', 'book', '#ffffff', 8),
    ('Personal Care', 'brush', '#ffffff', 9),
    ('Gifts', 'gift', '#ffffff', 10),
    ('Travel', 'airplane', '#ffffff', 11),
    ('Others', 'ellipsis-horizontal', '#ffffff', 12)");

    // Insert income categories
    $pdo->exec("INSERT INTO income_categories (name, icon, color, sort_order) VALUES
    ('Salary', 'cash', '#ffffff', 1),
    ('Freelance', 'laptop', '#ffffff', 2),
    ('Investments', 'trending-up', '#ffffff', 3),
    ('Gifts', 'gift', '#ffffff', 4),
    ('Rental', 'key', '#ffffff', 5),
    ('Others', 'ellipsis-horizontal', '#ffffff', 6)");

    $pdo->exec("SET FOREIGN_KEY_CHECKS=1");

    echo "Data seeded successfully!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
