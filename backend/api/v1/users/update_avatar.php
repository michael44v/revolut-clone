<?php
/**
 * POST /api/v1/users/update_avatar.php
 * Accepts base64 encoded image or multipart file upload and updates user's avatar_url in MySQL
 */

require_once __DIR__ . '/../../../config/cors.php';
handle_cors();

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/validation.php';
require_once __DIR__ . '/../../../includes/auth.php';

$user = require_authenticated_user();
$conn = get_db_connection();

$input = get_json_input();
$avatarUrl = null;

if (!empty($input['avatarUrl'])) {
    $avatarUrl = filter_var($input['avatarUrl'], FILTER_SANITIZE_URL);
} elseif (!empty($input['imageBase64'])) {
    // Process base64 image data
    $base64Data = $input['imageBase64'];
    if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
        $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
        $type = strtolower($type[1]); // jpg, png, gif, webp
        if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
            json_error('Invalid image type', 400);
        }
        $data = base64_decode($base64Data);
        if ($data === false) {
            json_error('Base64 decode failed', 400);
        }

        $uploadDir = __DIR__ . '/../../../uploads/avatars/';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0777, true);
        }

        $fileName = 'avatar_' . $user['id'] . '_' . time() . '.' . $type;
        $filePath = $uploadDir . $fileName;
        file_put_contents($filePath, $data);

        $appConfig = require __DIR__ . '/../../../config/app.php';
        $avatarUrl = rtrim($appConfig['app_url'], '/') . '/uploads/avatars/' . $fileName;
    } else {
        // Direct data URI storage fallback if not saving to disk
        $avatarUrl = $input['imageBase64'];
    }
} elseif (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['avatar']['tmp_name'];
    $fileName = $_FILES['avatar']['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    if (!in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
        json_error('Invalid image file format', 400);
    }

    $uploadDir = __DIR__ . '/../../../uploads/avatars/';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0777, true);
    }

    $newFileName = 'avatar_' . $user['id'] . '_' . time() . '.' . $fileExtension;
    $destPath = $uploadDir . $newFileName;

    if (move_uploaded_file($fileTmpPath, $destPath)) {
        $appConfig = require __DIR__ . '/../../../config/app.php';
        $avatarUrl = rtrim($appConfig['app_url'], '/') . '/uploads/avatars/' . $newFileName;
    } else {
        json_error('Failed to move uploaded file', 500);
    }
}

if (!$avatarUrl) {
    json_error('No valid avatar image or URL provided', 400);
}

$stmt = $conn->prepare("UPDATE users SET avatar_url = ? WHERE id = ?");
$stmt->bind_param("si", $avatarUrl, $user['id']);
$stmt->execute();
$stmt->close();

json_success('Profile picture updated successfully in database', [
    'avatarUrl' => $avatarUrl,
    'userId' => $user['user_uid']
]);
