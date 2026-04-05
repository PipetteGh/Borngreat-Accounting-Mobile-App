<?php
// backend/notifications/index.php — List notifications for the user
require_once __DIR__ . '/../helpers/auth_guard.php';
require_once __DIR__ . '/../config/database.php';

$db = get_db();

$stmt = $db->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
$stmt->execute([$userId]);
$notifications = $stmt->fetchAll();

// Count unread
$stmtCount = $db->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
$stmtCount->execute([$userId]);
$unreadCount = (int)$stmtCount->fetchColumn();

json_success([
    'notifications' => $notifications,
    'unread_count' => $unreadCount
]);
