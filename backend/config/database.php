<?php
/**
 * Procedural MySQLi Database Connection
 */

require_once __DIR__ . '/app.php';

function get_db_connection(): mysqli {
    static $conn = null;

    if ($conn instanceof mysqli) {
        if ($conn->ping()) {
            return $conn;
        }
    }

    $host = get_env_var('DB_HOST', '127.0.0.1');
    $port = (int) get_env_var('DB_PORT', 3306);
    $dbname = get_env_var('DB_NAME', 'fintech_db');
    $user = get_env_var('DB_USER', 'fintech_user');
    $pass = get_env_var('DB_PASS', 'fintech_secret_pass_123');

    // Enable reporting exceptions on error for prepared statement safety
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    try {
        $conn = mysqli_init();
        $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, 5);
        $conn->real_connect($host, $user, $pass, $dbname, $port);
        $conn->set_charset('utf8mb4');
        return $conn;
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'success' => false,
            'message' => 'Database service temporarily unavailable',
            'data' => null
        ]);
        exit;
    }
}
