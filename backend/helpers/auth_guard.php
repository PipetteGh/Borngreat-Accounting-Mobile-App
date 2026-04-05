<?php
// backend/helpers/auth_guard.php

require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/response.php';

function get_auth_token() {
    $headers = getallheaders();
    $authHeader = null;
    
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if (!$authHeader) {
        return null;
    }
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return $matches[1];
    }
    
    return null;
}

$token = get_auth_token();
if (!$token) {
    json_error('Unauthorized: No token provided', 401);
}

$payload = jwt_validate($token);
if (!$payload) {
    json_error('Unauthorized: Invalid or expired token', 401);
}

$userId = $payload['sub'];
// $userId is now available in the scope of files that require this guard.
