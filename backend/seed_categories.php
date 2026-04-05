<?php
// Direct DB cleanup - remove duplicate categories
require_once __DIR__ . '/config/database.php';
$db = get_db();

// Delete duplicate expense categories with higher IDs
$result = $db->exec("DELETE FROM expense_categories WHERE id > 23");
echo "Deleted $result duplicate expense rows with id > 23\n";

// Re-check income - insert if missing
$check = $db->query("SELECT id, name FROM income_categories WHERE name IN ('Business Income','Allowance','Savings Interest')");
$existing = $check->fetchAll(PDO::FETCH_COLUMN, 1);

$toAdd = [
    ['Business Income', 'storefront'],
    ['Allowance', 'card'],
    ['Savings Interest', 'analytics']
];

foreach ($toAdd as $cat) {
    if (!in_array($cat[0], $existing)) {
        $db->prepare("INSERT INTO income_categories (name, icon, color) VALUES (?, ?, '#ffffff')")->execute($cat);
        echo "Added income: {$cat[0]} (id: {$db->lastInsertId()})\n";
    } else {
        echo "Income exists: {$cat[0]}\n";
    }
}

// Final listing
echo "\n=== EXPENSE ===\n";
$s = $db->query("SELECT id, name FROM expense_categories ORDER BY id");
while ($r = $s->fetch()) echo "[{$r['id']}] {$r['name']}\n";

echo "\n=== INCOME ===\n";
$s = $db->query("SELECT id, name FROM income_categories ORDER BY id");
while ($r = $s->fetch()) echo "[{$r['id']}] {$r['name']}\n";
