<?php
// backend/auth/register.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validate.php';
require_once __DIR__ . '/../helpers/email.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];

require_fields($data, ['full_name', 'email', 'password']);

if (!validate_email($data['email'])) {
    json_error('Invalid email format');
}

$db = get_db();

// Check unique email
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$data['email']]);
if ($stmt->fetch()) {
    json_error('Email already registered');
}

// Create user
$passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
$stmt = $db->prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)");
$stmt->execute([$data['full_name'], $data['email'], $passwordHash]);
$userId = $db->lastInsertId();

$token = jwt_generate($userId);

// Send welcome email
$firstName = explode(' ', trim($data['full_name']))[0];
$welcomeSubject = "Welcome to Borngreat Accounting, {$firstName}!";
$welcomeBody = "
<div style='font-family: Segoe UI, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;'>
    <!-- Header -->
    <div style='background: linear-gradient(135deg, #7c5dfa, #5b3fd9); padding: 40px 30px; text-align: center; border-radius: 0 0 24px 24px;'>
        <h1 style='color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;'>Borngreat Accounting</h1>
        <p style='color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;'>Smart Financial Management</p>
    </div>

    <!-- Body -->
    <div style='padding: 40px 30px;'>
        <h2 style='color: #1B1B2F; margin: 0 0 20px; font-size: 22px;'>Welcome aboard, {$firstName}! 🎉</h2>
        
        <p style='color: #555; font-size: 15px; line-height: 1.7; margin-bottom: 24px;'>
            Thank you for joining <strong>Borngreat Accounting</strong>. We're excited to help you take control of your finances and build a prosperous future.
        </p>

        <div style='background: #F4F6FA; border-radius: 16px; padding: 24px; margin-bottom: 24px;'>
            <h3 style='color: #1B1B2F; margin: 0 0 16px; font-size: 16px;'>Here's what you can do:</h3>
            <table style='width: 100%;'>
                <tr>
                    <td style='padding: 8px 0; vertical-align: top;'>
                        <span style='display: inline-block; width: 28px; height: 28px; background: #26c986; border-radius: 50%; text-align: center; line-height: 28px; color: #fff; font-size: 14px; margin-right: 12px;'>✓</span>
                    </td>
                    <td style='padding: 8px 0; color: #555; font-size: 14px;'><strong>Track Income & Expenses</strong> — Log every transaction with categories</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; vertical-align: top;'>
                        <span style='display: inline-block; width: 28px; height: 28px; background: #7c5dfa; border-radius: 50%; text-align: center; line-height: 28px; color: #fff; font-size: 14px; margin-right: 12px;'>📊</span>
                    </td>
                    <td style='padding: 8px 0; color: #555; font-size: 14px;'><strong>Visual Reports</strong> — Charts, graphs, and detailed analytics</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; vertical-align: top;'>
                        <span style='display: inline-block; width: 28px; height: 28px; background: #ff914d; border-radius: 50%; text-align: center; line-height: 28px; color: #fff; font-size: 14px; margin-right: 12px;'>💰</span>
                    </td>
                    <td style='padding: 8px 0; color: #555; font-size: 14px;'><strong>Budget Management</strong> — Set budgets and track your spending</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; vertical-align: top;'>
                        <span style='display: inline-block; width: 28px; height: 28px; background: #00c8e2; border-radius: 50%; text-align: center; line-height: 28px; color: #fff; font-size: 14px; margin-right: 12px;'>📄</span>
                    </td>
                    <td style='padding: 8px 0; color: #555; font-size: 14px;'><strong>Export Reports</strong> — Generate PDF & CSV financial reports anytime</td>
                </tr>
            </table>
        </div>

        <p style='color: #555; font-size: 15px; line-height: 1.7; margin-bottom: 24px;'>
            You'll also receive a <strong>monthly financial summary</strong> via email so you always know where you stand.
        </p>

        <p style='color: #555; font-size: 15px; line-height: 1.7;'>
            Open the app and start by adding your first income or expense. Happy tracking!
        </p>
    </div>

    <!-- Footer -->
    <div style='background: #F4F6FA; padding: 24px 30px; text-align: center; border-radius: 24px 24px 0 0;'>
        <p style='color: #8E92A8; font-size: 12px; margin: 0;'>
            This email was sent to <strong>{$data['email']}</strong> because you registered for Borngreat Accounting.
        </p>
        <p style='color: #C8CBD9; font-size: 11px; margin: 8px 0 0;'>
            © " . date('Y') . " Borngreat Accounting. All rights reserved.
        </p>
    </div>
</div>
";

// Send email (non-blocking — don't fail registration if email fails)
try {
    send_smtp_email($data['email'], $welcomeSubject, $welcomeBody);
} catch (Exception $e) {
    error_log("Welcome email failed for {$data['email']}: " . $e->getMessage());
}

// Create welcome notification
try {
    $notifStmt = $db->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'success')");
    $notifStmt->execute([
        $userId,
        'Welcome to Borngreat Accounting! 🎉',
        "Hi {$firstName}, your account has been set up successfully. Start by adding your first income or expense to begin tracking your finances."
    ]);
} catch (Exception $e) {
    error_log("Welcome notification failed: " . $e->getMessage());
}

json_success([
    'message' => 'User registered successfully',
    'user' => [
        'id' => $userId,
        'full_name' => $data['full_name'],
        'email' => $data['email'],
        'currency_symbol' => '$'
    ],
    'token' => $token
], 201);

