<?php
require_once __DIR__ . '/config/database.php';

try {
    $pdo = get_db();
    $sql = file_get_contents(__DIR__ . '/../database/schema.sql');
    $pdo->exec($sql);
    echo "Database successfully seeded from schema.sql\n";
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Unknown database') !== false) {
        $dsn = "mysql:host=" . DB_HOST . ";charset=utf8mb4";
        $pdoServer = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $pdoServer->exec("CREATE DATABASE IF NOT EXISTS borngreat_accounting");
        $pdoServer->exec("USE borngreat_accounting");
        $sql = file_get_contents(__DIR__ . '/../database/schema.sql');
        $pdoServer->exec($sql);
        echo "Database created and successfully seeded from schema.sql\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
