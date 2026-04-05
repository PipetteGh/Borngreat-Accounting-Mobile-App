<?php
// backend/categories/expense.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

$db = get_db();
$stmt = $db->query("SELECT * FROM expense_categories ORDER BY sort_order ASC");
$categories = $stmt->fetchAll();

json_success(['categories' => $categories]);
