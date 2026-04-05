<?php
// backend/helpers/response.php

function json_success($data, $code = 200) {
    header('Content-Type: application/json');
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function json_error($message, $code = 400, $errors = []) {
    header('Content-Type: application/json');
    http_response_code($code);
    echo json_encode([
        'error' => $message,
        'errors' => $errors
    ]);
    exit;
}
