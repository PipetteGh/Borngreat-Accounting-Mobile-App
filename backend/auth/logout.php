<?php
// backend/auth/logout.php

require_once __DIR__ . '/../helpers/response.php';

// Stateless logout - just return a success message
json_success(['message' => 'Logged out successfully']);
