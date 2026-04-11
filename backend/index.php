<?php
// backend/index.php

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse Request URI and strip base directory path
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = dirname($_SERVER['SCRIPT_NAME']);
if ($basePath === '/' || $basePath === '\\') $basePath = '';
if (strpos($uri, $basePath) === 0) {
    $uri = substr($uri, strlen($basePath));
}
$uri = trim($uri, '/');
$uri = preg_replace('/^api\//', '', $uri);
$method = $_SERVER['REQUEST_METHOD'];

// Helper for dynamic routing with ID extraction
$routeId = null;
$cleanUri = $uri;

if (preg_match('/^(transactions|budgets|notifications)\/([0-9]+)$/', $uri, $matches)) {
    $cleanUri = $matches[1] . '/{id}';
    $routeId = $matches[2];
}

$routes = [
    'POST' => [
        'auth/register' => 'auth/register.php',
        'auth/login' => 'auth/login.php',
        'auth/logout' => 'auth/logout.php',
        'accounts/create' => 'accounts/create.php',
        'accounts/update' => 'accounts/update.php',
        'accounts/delete' => 'accounts/delete.php',
        'transactions' => 'transactions/create.php',
        'budgets' => 'budgets/upsert.php',
        'notifications/mark-read' => 'notifications/mark_read.php'
    ],
    'GET' => [
        'auth/me' => 'auth/me.php',
        'categories/expense' => 'categories/expense.php',
        'categories/income' => 'categories/income.php',
        'accounts' => 'accounts/index.php',
        'transactions' => 'transactions/index.php',
        'transactions/{id}' => 'transactions/show.php',
        'dashboard/summary' => 'dashboard/summary.php',
        'dashboard/category-breakdown' => 'dashboard/breakdown.php',
        'dashboard/trend' => 'dashboard/trend.php',
        'budgets' => 'budgets/index.php',
        'reports/export' => 'reports/export.php',
        'notifications' => 'notifications/index.php'
    ],
    'PUT' => [
        'auth/profile' => 'auth/profile.php',
        'transactions/{id}' => 'transactions/update.php'
    ],
    'DELETE' => [
        'transactions/{id}' => 'transactions/delete.php',
        'budgets/{id}' => 'budgets/delete.php'
    ]
];

if (isset($routes[$method][$cleanUri])) {
    $handler = $routes[$method][$cleanUri];
    if (file_exists(__DIR__ . '/' . $handler)) {
        require_once __DIR__ . '/' . $handler;
    } else {
        header('Content-Type: application/json');
        http_response_code(404);
        echo json_encode(['error' => 'Handler file not found: ' . $handler]);
    }
} else {
    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode(['error' => 'Route not found: ' . $method . ' ' . $uri]);
}
