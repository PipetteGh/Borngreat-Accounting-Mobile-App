<?php
require_once __DIR__ . '/config/database.php';

try {
    $pdo = get_db();
    
    $name = 'Peter Borngreat-Mensah';
    $email = 'peterborngreatmensah@gmail.com';
    $raw_password = 'Provider1@1%';
    
    // Hash the password securely
    $hashed_password = password_hash($raw_password, PASSWORD_DEFAULT);
    
    // Prepare insert statement with 'ON DUPLICATE KEY UPDATE' to handle existing users
    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password_hash) VALUES (:name, :email, :password) 
                           ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash)");
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':password' => $hashed_password
    ]);

    echo "User created or updated successfully!";
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo "User with this email already exists.";
    } else {
        echo "Error: " . $e->getMessage();
    }
}
