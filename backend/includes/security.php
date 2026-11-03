<?php
/**
 * Procedural Security & Rate Limiting Helpers
 */

require_once __DIR__ . '/../config/database.php';

function enforce_rate_limit(string $action = 'auth', int $maxAttempts = 15, int $windowSeconds = 60): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $tmpDir = sys_get_temp_dir() . '/fintech_rate_limits';
    if (!is_dir($tmpDir)) {
        @mkdir($tmpDir, 0777, true);
    }

    $hash = md5("{$action}_{$ip}");
    $file = "{$tmpDir}/{$hash}.json";

    $now = time();
    $data = ['count' => 0, 'first_attempt' => $now];

    if (file_exists($file)) {
        $content = file_get_contents($file);
        $decoded = json_decode($content, true);
        if ($decoded && ($now - $decoded['first_attempt']) < $windowSeconds) {
            $data = $decoded;
        }
    }

    $data['count']++;
    file_put_contents($file, json_encode($data));

    if ($data['count'] > $maxAttempts) {
        http_response_code(429);
        header('Retry-After: ' . ($windowSeconds - ($now - $data['first_attempt'])));
        echo json_encode([
            'success' => false,
            'message' => 'Too many requests. Please slow down and try again later.',
            'data' => null
        ]);
        exit;
    }
}
