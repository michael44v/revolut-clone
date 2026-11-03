<?php
/**
 * Procedural Validation and Sanitization functions
 */

function sanitize_string(?string $val): string {
    if ($val === null) return '';
    return trim(htmlspecialchars(strip_tags($val), ENT_QUOTES, 'UTF-8'));
}

function sanitize_email(?string $email): string {
    if ($email === null) return '';
    return strtolower(trim(filter_var($email, FILTER_SANITIZE_EMAIL)));
}

function validate_email(string $email): bool {
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validate_positive_amount($amount): ?float {
    if (!is_numeric($amount)) return null;
    $val = (float) $amount;
    return $val > 0 ? $val : null;
}

function amount_to_minor($amount): int {
    return (int) round((float) $amount * 100);
}

function minor_to_amount(int $minor): float {
    return round($minor / 100, 2);
}

function validate_supported_currency(string $curr): bool {
    return in_array(strtoupper($curr), ['USD', 'GBP', 'EUR', 'NGN'], true);
}

function get_currency_symbol(string $curr): string {
    return match (strtoupper($curr)) {
        'GBP' => '£',
        'EUR' => '€',
        'NGN' => '₦',
        default => '$'
    };
}

function get_currency_flag(string $curr): string {
    return match (strtoupper($curr)) {
        'GBP' => '🇬🇧',
        'EUR' => '🇪🇺',
        'NGN' => '🇳🇬',
        default => '🇺🇸'
    };
}
