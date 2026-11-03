<?php
/**
 * Application environment configuration
 */

if (!function_exists('get_env_var')) {
    function get_env_var($key, $default = null) {
        $val = getenv($key);
        if ($val !== false) {
            return $val;
        }
        if (isset($_ENV[$key])) {
            return $_ENV[$key];
        }
        if (isset($_SERVER[$key])) {
            return $_SERVER[$key];
        }
        return $default;
    }
}

// Load .env file if it exists
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (str_contains($line, '=')) {
            list($name, $val) = explode('=', $line, 2);
            $name = trim($name);
            $val = trim($val);
            putenv("{$name}={$val}");
            $_ENV[$name] = $val;
            $_SERVER[$name] = $val;
        }
    }
}

return [
    'app_name' => 'Revolut FinTech API',
    'app_env' => get_env_var('APP_ENV', 'development'),
    'app_url' => get_env_var('APP_URL', 'http://localhost:8000'),
    'jwt_secret' => get_env_var('JWT_SECRET', 'super_secret_fintech_jwt_signing_key_928472918349281729'),
    'jwt_expiry' => (int) get_env_var('JWT_EXPIRY_SECONDS', 86400),
    'refresh_expiry' => (int) get_env_var('REFRESH_TOKEN_EXPIRY_SECONDS', 2592000),
];
