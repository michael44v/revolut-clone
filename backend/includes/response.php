<?php
/**
 * Procedural API JSON response helpers
 */

function json_response(bool $success, string $message, $data = null, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');

    $payload = [
        'success' => $success,
        'message' => $message,
        'data' => $data
    ];

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_success(string $message = 'Success', $data = null, int $statusCode = 200): void {
    json_response(true, $message, $data, $statusCode);
}

function json_error(string $message = 'An error occurred', int $statusCode = 400, $data = null): void {
    json_response(false, $message, $data, $statusCode);
}

function get_json_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}
