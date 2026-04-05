<?php
// backend/notifications/mark_read.php — Mark all notifications as read
require_once __DIR__ . '/../helpers/auth_guard.php';
require_once __DIR__ . '/../config/database.php';

$db = get_db();

$stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
$stmt->execute([$userId]);

json_success(['message' => 'All notifications marked as read']);
