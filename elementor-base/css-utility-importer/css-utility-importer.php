<?php
/**
 * Plugin Name: Skelementor
 * Plugin URI: https://skelementor.com
 * Description: CSS utilities and variables importer for Elementor v4. Paste CSS and import classes + custom variables directly into Elementor.
 * Version: 1.0.0
 * Author: Rajin Khan
 * Author URI: https://rajinkhan.com
 * License: GPL v2 or later
 * Text Domain: css-utility-importer
 * Requires at least: 6.0
 * Tested up to: 6.4
 * Requires PHP: 8.0
 * Elementor tested up to: 3.29
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('CSS_UTILITY_IMPORTER_VERSION', '1.0.0');
define('CSS_UTILITY_IMPORTER_FILE', __FILE__);
define('CSS_UTILITY_IMPORTER_PATH', plugin_dir_path(__FILE__));
define('CSS_UTILITY_IMPORTER_URL', plugin_dir_url(__FILE__));
define('CSS_UTILITY_IMPORTER_BASENAME', plugin_basename(__FILE__));

// Check if Elementor is active
add_action('admin_init', 'css_utility_importer_check_elementor');
function css_utility_importer_check_elementor() {
    if (!class_exists('Elementor\Plugin')) {
        add_action('admin_notices', 'css_utility_importer_elementor_notice');
        deactivate_plugins(plugin_basename(__FILE__));
    }
}

function css_utility_importer_elementor_notice() {
    echo '<div class="notice notice-error"><p>';
    echo __('Skelementor requires Elementor to be installed and active.', 'css-utility-importer');
    echo '</p></div>';
}

// Check if Elementor v4 features are available
add_action('admin_init', 'css_utility_importer_check_elementor_v4');
function css_utility_importer_check_elementor_v4() {
    if (class_exists('Elementor\Plugin')) {
        $experiments = \Elementor\Plugin::$instance->experiments;
        if (!$experiments->is_feature_active('e_classes') || !$experiments->is_feature_active('e_atomic_elements')) {
            add_action('admin_notices', 'css_utility_importer_v4_notice');
        }
    }
}

function css_utility_importer_v4_notice() {
    echo '<div class="notice notice-warning"><p>';
    echo __('Skelementor requires Elementor v4 features (Global Classes and Atomic Elements) to be enabled.', 'css-utility-importer');
    echo ' <a href="' . admin_url('admin.php?page=elementor#tab-experiments') . '">' . __('Enable them here', 'css-utility-importer') . '</a>';
    echo '</p></div>';
}

// Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'CSSUtilityImporter\\';
    $base_dir = CSS_UTILITY_IMPORTER_PATH . 'includes/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    } else {
        // Debug: Log missing file
        error_log("CSS Utility Importer: Class file not found: $file for class: $class");
    }
});

// Initialize the plugin
add_action('plugins_loaded', 'css_utility_importer_init');
function css_utility_importer_init() {
    if (!class_exists('Elementor\Plugin')) {
        return;
    }
    
    // Debug: Check if the class file exists
    $main_plugin_file = CSS_UTILITY_IMPORTER_PATH . 'includes/MainPlugin.php';
    if (!file_exists($main_plugin_file)) {
        error_log("CSS Utility Importer: MainPlugin.php not found at: $main_plugin_file");
        return;
    }
    
    // Manually require all necessary files
    $required_files = [
        'includes/MainPlugin.php',
        'includes/CSSParser.php',
        'includes/ClassMapper.php',
        'includes/ElementorIntegration.php',
        'includes/VariablesIntegration.php',
        'includes/AdminInterface.php',
        'includes/SettingsManager.php'
    ];
    
    foreach ($required_files as $file) {
        $file_path = CSS_UTILITY_IMPORTER_PATH . $file;
        if (file_exists($file_path)) {
            require_once $file_path;
        } else {
            error_log("CSS Utility Importer: Required file not found: $file_path");
        }
    }
    
    // Initialize the main plugin class using singleton pattern
    CSSUtilityImporter\MainPlugin::get_instance();
}

// Activation hook
register_activation_hook(__FILE__, 'css_utility_importer_activate');
function css_utility_importer_activate() {
    // Create necessary database tables or options
    add_option('css_utility_importer_version', CSS_UTILITY_IMPORTER_VERSION);
    add_option('css_utility_importer_settings', [
        'auto_import' => false,
        'import_frequency' => 'manual',
        'css_files' => [],
        'imported_classes' => []
    ]);
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'css_utility_importer_deactivate');
function css_utility_importer_deactivate() {
    // Clean up if needed
}
