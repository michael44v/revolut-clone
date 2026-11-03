<?php
/**
 * GET /api/v1/auth/me.php
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/auth.php';

$user = require_authenticated_user();

$userData = [
    'id' => $user['user_uid'],
    'name' => $user['name'],
    'email' => $user['email'],
    'avatar' => $user['avatar_url'],
    'tag' => $user['revtag'],
    'kycStatus' => $user['kyc_status'],
    'tier' => $user['tier'],
    'isDemo' => (bool) $user['is_demo']
];

json_success('Authenticated user retrieved', ['user' => $userData]);
