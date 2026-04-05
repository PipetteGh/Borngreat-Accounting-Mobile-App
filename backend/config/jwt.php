<?php
// backend/config/jwt.php

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'borngreat_accounting_secret_key_2026');

function base64url_encode(string $data): string {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function base64url_decode(string $data): string {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $data .= str_repeat('=', $padlen);
    }
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

function jwt_generate(int $userId): string {
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $payload = json_encode([
        'sub' => $userId,
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 days
    ]);

    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode($payload);

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64url_encode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function jwt_validate(string $token): array|false {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }

    $header = $parts[0];
    $payload = $parts[1];
    $signature = $parts[2];

    $validSignature = base64url_encode(hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true));

    if (!hash_equals($validSignature, $signature)) {
        return false;
    }

    $payloadData = json_decode(base64url_decode($payload), true);
    
    if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
        return false; // Expired
    }

    return $payloadData;
}
