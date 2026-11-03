<?php
/**
 * Procedural Notification functions
 */

require_once __DIR__ . '/../config/database.php';

function create_notification(int $userId, string $type, string $title, string $message, string $icon = 'Bell'): string {
    $conn = get_db_connection();
    $notifUid = 'notif_' . time() . '_' . bin2hex(random_bytes(3));

    $stmt = $conn->prepare("INSERT INTO notifications (notification_uid, user_id, type, title, message, icon, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)");
    $stmt->bind_param("sissss", $notifUid, $userId, $type, $title, $message, $icon);
    $stmt->execute();
    $stmt->close();

    return $notifUid;
}

function get_user_notifications(int $userId, int $limit = 30): array {
    $conn = get_db_connection();
    $stmt = $conn->prepare("SELECT notification_uid as id, type, title, message, icon, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT ?");
    $stmt->bind_param("ii", $userId, $limit);
    $stmt->execute();
    $res = $stmt->get_result();

    $notifs = [];
    $unreadCount = 0;

    while ($row = $res->fetch_assoc()) {
        $isRead = (bool) $row['is_read'];
        if (!$isRead) $unreadCount++;

        // Format relative time
        $timeDiff = time() - strtotime($row['created_at']);
        if ($timeDiff < 60) {
            $timeStr = 'Just now';
        } elseif ($timeDiff < 3600) {
            $timeStr = round($timeDiff / 60) . 'm ago';
        } elseif ($timeDiff < 86400) {
            $timeStr = round($timeDiff / 3600) . 'h ago';
        } else {
            $timeStr = date('M j', strtotime($row['created_at']));
        }

        $notifs[] = [
            'id' => $row['id'],
            'type' => $row['type'],
            'title' => $row['title'],
            'message' => $row['message'],
            'icon' => $row['icon'],
            'read' => $isRead,
            'time' => $timeStr,
            'createdAt' => $row['created_at']
        ];
    }
    $stmt->close();

    return [
        'notifications' => $notifs,
        'unreadCount' => $unreadCount
    ];
}
