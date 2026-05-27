<?php
/**
 * 卸载时清理 — 只在用户从 WP 后台点 "删除" 时触发,停用不触发
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

delete_option('ai_avatar_settings');
