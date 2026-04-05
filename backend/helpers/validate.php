<?php
// backend/helpers/validate.php

function require_fields(array $data, array $fields): void {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            $missing[] = $field;
        }
    }

    if (!empty($missing)) {
        json_error("Missing required fields: " . implode(', ', $missing), 400, ['missing_fields' => $missing]);
    }
}

function validate_email(string $email): bool {
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validate_positive_number($n): bool {
    return is_numeric($n) && $n > 0;
}

function validate_date(string $date, string $format = 'Y-m-d'): bool {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}
