<?php
/**
 * Plugin Name:       AI Avatar — 3D Digital Human Chat Widget
 * Plugin URI:        https://avataraisdk.com/wordpress
 * Description:       The only WordPress chatbot with a real 3D digital human — voice chat, real-time lip-sync, 3-minute setup, no coding.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            AI Avatar Team
 * Author URI:        https://avataraisdk.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       ai-avatar
 * Domain Path:       /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('AI_AVATAR_VERSION', '1.0.0');
define('AI_AVATAR_OPTION_KEY', 'ai_avatar_settings');
define('AI_AVATAR_DEFAULT_SDK_URL', 'https://embed.avataraisdk.com/widget.iife.js');

/**
 * Default settings — user can override in admin
 */
function ai_avatar_default_settings(): array {
    return [
        'token'          => '',
        'agent_id'       => '',
        'sdk_url'        => AI_AVATAR_DEFAULT_SDK_URL,
        'auto_inject'    => '1',
        'position'       => 'bottom-right',
        'theme'          => 'light',
        'primary_color'  => '#6366F1',
        'size'           => 'normal',
        'auto_open'      => '0',
        'greeting'       => '',
        'hide_on_admin'  => '1',
        'excluded_pages' => '',
    ];
}

/**
 * Read settings, merged with defaults
 */
function ai_avatar_get_settings(): array {
    $saved = get_option(AI_AVATAR_OPTION_KEY, []);
    return wp_parse_args(is_array($saved) ? $saved : [], ai_avatar_default_settings());
}

/* ============================================================
 * 0) Load translations
 * ============================================================ */

add_action('plugins_loaded', 'ai_avatar_load_textdomain');
function ai_avatar_load_textdomain(): void {
    load_plugin_textdomain(
        'ai-avatar',
        false,
        dirname(plugin_basename(__FILE__)) . '/languages'
    );
}

/* ============================================================
 * 1) Activation hook
 * ============================================================ */

register_activation_hook(__FILE__, 'ai_avatar_on_activate');
function ai_avatar_on_activate(): void {
    if (false === get_option(AI_AVATAR_OPTION_KEY)) {
        add_option(AI_AVATAR_OPTION_KEY, ai_avatar_default_settings());
    }
}

/* ============================================================
 * 2) Admin settings page (Settings → AI Avatar)
 * ============================================================ */

add_action('admin_menu', 'ai_avatar_admin_menu');
function ai_avatar_admin_menu(): void {
    add_options_page(
        __('AI Avatar Settings', 'ai-avatar'),
        __('AI Avatar', 'ai-avatar'),
        'manage_options',
        'ai-avatar',
        'ai_avatar_render_settings_page'
    );
}

add_action('admin_init', 'ai_avatar_register_settings');
function ai_avatar_register_settings(): void {
    register_setting(
        'ai_avatar_settings_group',
        AI_AVATAR_OPTION_KEY,
        ['sanitize_callback' => 'ai_avatar_sanitize_settings']
    );
}

/**
 * Input sanitization — any user-submitted field passes through here
 */
function ai_avatar_sanitize_settings($input): array {
    $defaults = ai_avatar_default_settings();
    $clean = [];

    $clean['token']          = isset($input['token']) ? sanitize_text_field($input['token']) : '';
    $clean['agent_id']       = isset($input['agent_id']) ? sanitize_text_field($input['agent_id']) : '';
    $clean['sdk_url']        = isset($input['sdk_url']) ? esc_url_raw($input['sdk_url']) : $defaults['sdk_url'];
    $clean['auto_inject']    = !empty($input['auto_inject']) ? '1' : '0';
    $clean['hide_on_admin']  = !empty($input['hide_on_admin']) ? '1' : '0';
    $clean['auto_open']      = !empty($input['auto_open']) ? '1' : '0';
    $clean['greeting']       = isset($input['greeting']) ? sanitize_text_field($input['greeting']) : '';
    $clean['excluded_pages'] = isset($input['excluded_pages']) ? sanitize_text_field($input['excluded_pages']) : '';

    $valid_positions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    $clean['position'] = in_array($input['position'] ?? '', $valid_positions, true)
        ? $input['position'] : $defaults['position'];

    $valid_themes = ['light', 'dark', 'auto'];
    $clean['theme'] = in_array($input['theme'] ?? '', $valid_themes, true)
        ? $input['theme'] : $defaults['theme'];

    $valid_sizes = ['compact', 'normal', 'large'];
    $clean['size'] = in_array($input['size'] ?? '', $valid_sizes, true)
        ? $input['size'] : $defaults['size'];

    $color = $input['primary_color'] ?? '';
    $clean['primary_color'] = preg_match('/^#[0-9A-Fa-f]{6}$/', $color)
        ? $color : $defaults['primary_color'];

    return $clean;
}

/**
 * Settings page HTML
 */
function ai_avatar_render_settings_page(): void {
    if (!current_user_can('manage_options')) {
        return;
    }
    $s = ai_avatar_get_settings();
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('AI Avatar Settings', 'ai-avatar'); ?></h1>

        <div class="notice notice-info inline" style="margin: 16px 0;">
            <p>
                <strong><?php esc_html_e('About this plugin', 'ai-avatar'); ?></strong><br>
                <?php esc_html_e('This plugin ships with a hosted demo LLM so you can try the 3D avatar in minutes. For production use with your own LLM (OpenAI, Claude, internal API), please use the JavaScript SDK in external mode.', 'ai-avatar'); ?>
                <a href="https://www.npmjs.com/package/@ai-avatar/embed-sdk" target="_blank"><?php esc_html_e('Learn more', 'ai-avatar'); ?></a>
            </p>
        </div>

        <?php if (empty($s['token'])): ?>
            <div class="notice notice-warning">
                <p><strong><?php esc_html_e('Please fill in your API Key — the avatar will not appear until you do.', 'ai-avatar'); ?></strong>
                <?php esc_html_e('No key yet?', 'ai-avatar'); ?>
                <a href="https://avataraisdk.com" target="_blank"><?php esc_html_e('Get one', 'ai-avatar'); ?></a></p>
            </div>
        <?php endif; ?>

        <form method="post" action="options.php">
            <?php settings_fields('ai_avatar_settings_group'); ?>

            <h2><?php esc_html_e('Required', 'ai-avatar'); ?></h2>
            <table class="form-table" role="presentation">
                <tr>
                    <th><label for="ai_avatar_token"><?php esc_html_e('API Key', 'ai-avatar'); ?></label></th>
                    <td>
                        <input type="text" id="ai_avatar_token" name="<?php echo esc_attr(AI_AVATAR_OPTION_KEY); ?>[token]"
                               value="<?php echo esc_attr($s['token']); ?>" class="regular-text" placeholder="sk-...">
                        <p class="description"><?php esc_html_e('Generate one in the AI Avatar console.', 'ai-avatar'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th><label for="ai_avatar_agent_id"><?php esc_html_e('Agent ID', 'ai-avatar'); ?></label></th>
                    <td>
                        <input type="text" id="ai_avatar_agent_id" name="<?php echo esc_attr(AI_AVATAR_OPTION_KEY); ?>[agent_id]"
                               value="<?php echo esc_attr($s['agent_id']); ?>" class="regular-text" placeholder="agent_...">
                        <p class="description"><?php esc_html_e('Optional — leave blank to auto-detect from the API Key.', 'ai-avatar'); ?></p>
                    </td>
                </tr>
            </table>

            <h2><?php esc_html_e('Appearance', 'ai-avatar'); ?></h2>
            <table class="form-table" role="presentation">
                <tr>
                    <th><?php esc_html_e('Position', 'ai-avatar'); ?></th>
                    <td>
                        <select name="<?php echo esc_attr(AI_AVATAR_OPTION_KEY); ?>[position]">
                            <option value="bottom-right" <?php selected($s['position'], 'bottom-right'); ?>><?php esc_html_e('Bottom right', 'ai-avatar'); ?></option>
                            <option value="bottom-left"  <?php selected($s['position'], 'bottom-left'); ?>><?php esc_html_e('Bottom left', 'ai-avatar'); ?></option>
                            <option value="top-right"    <?php selected($s['position'], 'top-right'); ?>><?php esc_html_e('Top right', 'ai-avatar'); ?></option>
                            <option value="top-left"     <?php selected($s['position'], 'top-left'); ?>><?php esc_html_e('Top left', 'ai-avatar'); ?></option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><?php esc_html_e('Theme', 'ai-avatar'); ?></th>
                    <td>
                        <select name="<?php echo esc_attr(AI_AVATAR_OPTION_KEY); ?>[theme]">
                            <option value="light" <?php selected($s['theme'], 'light'); ?>><?php esc_html_e('Light', 'ai-avatar'); ?></option>
                            <option value="dark"  <?php selected($s['theme'], 'dark'); ?>><?php esc_html_e('Dark', 'ai-avatar'); ?></option>
                            <option value="auto"  <?php selected($s['theme'], 'auto'); ?>><?php esc_html_e('Auto (match system)', 'ai-avatar'); ?></option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><?php esc_html_e('Primary color', 'ai-avatar'); ?></th>
                    <td>
                        <input type="text" name="<?php echo esc_attr(AI_AVATAR_OPTION_KEY); ?>[primary_color]"
                               value="<?php echo esc_attr($s['primary_color']); ?>" class="regular-text" placeholder="#6366F1">
                        <p class="description"><?php esc_html_e('Hex color, e.g. #6366F1', 'ai-avatar'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th><?php esc_html_e('Size', 'ai-avatar'); ?></th>
                    <td>
                        <select name="<?php echo esc_attr(AI_AVATAR_OPTION_KEY); ?>[size]">
                            <option value="compact" <?php selected($s['size'], 'compact'); ?>><?php esc_html_e('Compact', 'ai-avatar'); ?></option>
                            <option value="normal"  <?php selected($s['size'], 'normal'); ?>><?php esc_html_e('Normal', 'ai-avatar'); ?></option>
                            <option value="large"   <?php selected($s['size'], 'large'); ?>><?php esc_html_e('Large', 'ai-avatar'); ?></option>
                        </select>
                    </td>
                </tr>
            </table>

            <h2><?php esc_html_e('Behavior', 'ai-avatar'); ?></h2>
            <table class="form-table" role="presentation">
                <tr>
                    <th><?php esc_html_e('Site-wide auto-inject', 'ai-avatar'); ?></th>
                    <td>
                        <label>
                            <input type="checkbox" name="<?php echo esc_attr(AI_AVATAR_OPTION_KEY); ?>[auto_inject]"
                                   value="1" <?php checked($s['auto_inject'], '1'); ?>>
                            <?php esc_html_e('Show the bubble on every frontend page', 'ai-avatar'); ?>
                        </label>
                        <p class="description"><?php
                            esc_html_e('When disabled, the avatar only shows where you use the [ai_avatar] shortcode.', 'ai-avatar');
                        ?></p>
                    </td>
                </tr>
                <tr>
                    <th><?php esc_html_e('Auto-open', 'ai-avatar'); ?></th>
                    <td>
                        <label>
                            <input type="checkbox" name="<?php echo esc_attr(AI_AVATAR_OPTION_KEY); ?>[auto_open]"
                                   value="1" <?php checked($s['auto_open'], '1'); ?>>
                            <?php esc_html_e('Expand the chat panel automatically on page load', 'ai-avatar'); ?>
                        </label>
                    </td>
                </tr>
                <tr>
                    <th><label for="ai_avatar_greeting"><?php esc_html_e('Greeting message', 'ai-avatar'); ?></label></th>
                    <td>
                        <input type="text" id="ai_avatar_greeting" name="<?php echo esc_attr(AI_AVATAR_OPTION_KEY); ?>[greeting]"
                               value="<?php echo esc_attr($s['greeting']); ?>" class="regular-text"
                               placeholder="<?php esc_attr_e('Hi! How can I help you today?', 'ai-avatar'); ?>">
                    </td>
                </tr>
                <tr>
                    <th><label for="ai_avatar_excluded"><?php esc_html_e('Excluded page IDs', 'ai-avatar'); ?></label></th>
                    <td>
                        <input type="text" id="ai_avatar_excluded" name="<?php echo esc_attr(AI_AVATAR_OPTION_KEY); ?>[excluded_pages]"
                               value="<?php echo esc_attr($s['excluded_pages']); ?>" class="regular-text" placeholder="2, 15, 42">
                        <p class="description"><?php
                            esc_html_e('Comma-separated page IDs where the avatar should not appear.', 'ai-avatar');
                        ?></p>
                    </td>
                </tr>
            </table>

            <h2><?php esc_html_e('Advanced', 'ai-avatar'); ?></h2>
            <table class="form-table" role="presentation">
                <tr>
                    <th><label for="ai_avatar_sdk_url"><?php esc_html_e('SDK URL', 'ai-avatar'); ?></label></th>
                    <td>
                        <input type="url" id="ai_avatar_sdk_url" name="<?php echo esc_attr(AI_AVATAR_OPTION_KEY); ?>[sdk_url]"
                               value="<?php echo esc_attr($s['sdk_url']); ?>" class="regular-text">
                        <p class="description"><?php
                            printf(
                                /* translators: %s: default SDK URL */
                                esc_html__('Default: %s — usually no need to change.', 'ai-avatar'),
                                '<code>' . esc_html(AI_AVATAR_DEFAULT_SDK_URL) . '</code>'
                            );
                        ?></p>
                    </td>
                </tr>
            </table>

            <?php submit_button(); ?>
        </form>

        <hr>

        <h2><?php esc_html_e('How to use', 'ai-avatar'); ?></h2>
        <p><?php esc_html_e('Pick either:', 'ai-avatar'); ?></p>
        <ol>
            <li><strong><?php esc_html_e('Site-wide:', 'ai-avatar'); ?></strong>
                <?php esc_html_e('Tick "Site-wide auto-inject" above — every page shows the bubble.', 'ai-avatar'); ?></li>
            <li><strong><?php esc_html_e('Specific spots:', 'ai-avatar'); ?></strong>
                <?php esc_html_e('Write the shortcode in any post or page:', 'ai-avatar'); ?>
                <code>[ai_avatar]</code></li>
        </ol>
    </div>
    <?php
}

/**
 * Add a "Settings" quick link on the Plugins list page
 */
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'ai_avatar_settings_link');
function ai_avatar_settings_link(array $links): array {
    $url = admin_url('options-general.php?page=ai-avatar');
    array_unshift($links, '<a href="' . esc_url($url) . '">' . esc_html__('Settings', 'ai-avatar') . '</a>');
    return $links;
}

/* ============================================================
 * 3) Shortcode [ai_avatar]
 * ============================================================ */

add_shortcode('ai_avatar', 'ai_avatar_shortcode_handler');
function ai_avatar_shortcode_handler($atts): string {
    $s = ai_avatar_get_settings();
    if (empty($s['token'])) {
        return '';
    }

    $atts = shortcode_atts([
        'position' => '',
        'theme'    => '',
    ], $atts, 'ai_avatar');

    $overrides = [];
    if (!empty($atts['position'])) $overrides['position'] = $atts['position'];
    if (!empty($atts['theme']))    $overrides['theme']    = $atts['theme'];

    ai_avatar_enqueue_sdk_once($s['sdk_url']);
    return ai_avatar_kses(ai_avatar_build_tag($s, $overrides));
}

/* ============================================================
 * 4) Auto-inject into frontend footer
 * ============================================================ */

add_action('wp_footer', 'ai_avatar_auto_inject');
function ai_avatar_auto_inject(): void {
    $s = ai_avatar_get_settings();
    if (empty($s['token']) || $s['auto_inject'] !== '1' || !ai_avatar_should_display($s)) {
        return;
    }
    ai_avatar_enqueue_sdk_once($s['sdk_url']);
    echo ai_avatar_kses(ai_avatar_build_tag($s));
}

/**
 * Should the avatar render on this request?
 */
function ai_avatar_should_display(array $s): bool {
    if (is_admin() && $s['hide_on_admin'] === '1') {
        return false;
    }
    if (!empty($s['excluded_pages'])) {
        $excluded = array_filter(array_map('intval', explode(',', $s['excluded_pages'])));
        $current_id = get_queried_object_id();
        if (in_array($current_id, $excluded, true)) {
            return false;
        }
    }
    return true;
}

/**
 * Enqueue the SDK script via WordPress's standard script API (cache-friendly,
 * dequeueable by other plugins). No-op if already enqueued.
 */
function ai_avatar_enqueue_sdk_once(string $sdk_url): void {
    if (wp_script_is('ai-avatar-sdk', 'enqueued')) {
        return;
    }
    wp_enqueue_script(
        'ai-avatar-sdk',
        $sdk_url,
        [],
        AI_AVATAR_VERSION,
        ['strategy' => 'async', 'in_footer' => true]
    );
}

/**
 * Run wp_kses on the rendered <ai-avatar> tag with an explicit allowlist for
 * the custom Web Component attributes (wp_kses strips unknown tags by default).
 */
function ai_avatar_kses(string $html): string {
    return wp_kses($html, [
        'ai-avatar' => [
            'token'         => true,
            'agent-id'      => true,
            'position'      => true,
            'theme'         => true,
            'primary-color' => true,
            'size'          => true,
            'greeting'      => true,
            'locale'        => true,
            'auto-open'     => true,
        ],
    ]);
}

/**
 * Convert WordPress locale (e.g. 'zh_CN') to BCP47 (e.g. 'zh-CN') for the SDK.
 */
function ai_avatar_wp_locale_to_bcp47(): string {
    $wp_locale = get_locale(); // e.g. 'zh_CN', 'en_US', 'ja', 'fr_FR'
    return str_replace('_', '-', $wp_locale);
}

/**
 * Build the <ai-avatar> tag — every attr is esc_attr'd
 */
function ai_avatar_build_tag(array $s, array $overrides = []): string {
    $merged = array_merge($s, $overrides);

    $attrs = [
        'token'         => $merged['token'],
        'agent-id'      => $merged['agent_id'],
        'position'      => $merged['position'],
        'theme'         => $merged['theme'],
        'primary-color' => $merged['primary_color'],
        'size'          => $merged['size'],
        'greeting'      => $merged['greeting'],
        // Pass WordPress site locale so the iframe UI (chat panel labels, input
        // placeholder) follows the host site's language instead of browser language.
        'locale'        => ai_avatar_wp_locale_to_bcp47(),
    ];

    $html = '<ai-avatar';
    foreach ($attrs as $key => $val) {
        if ($val === '' || $val === null) {
            continue;
        }
        $html .= ' ' . esc_attr($key) . '="' . esc_attr($val) . '"';
    }
    if ($merged['auto_open'] === '1') {
        $html .= ' auto-open';
    }
    $html .= '></ai-avatar>';

    return $html;
}
