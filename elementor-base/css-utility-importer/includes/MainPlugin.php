<?php

namespace CSSUtilityImporter;

use Elementor\Plugin;

class MainPlugin {
    
    private static $instance = null;
    public $elementor_integration = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init_hooks();
        $this->init_components();
    }
    
    private function init_hooks() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
        add_action('wp_ajax_css_utility_import', [$this, 'handle_import_ajax']);
        add_action('wp_ajax_css_utility_parse', [$this, 'handle_parse_ajax']);
        add_action('wp_ajax_css_utility_sync', [$this, 'handle_sync_ajax']);
        add_action('wp_ajax_css_utility_get_classes', [$this, 'handle_get_classes_ajax']);
        add_action('wp_ajax_css_utility_delete_class', [$this, 'handle_delete_class_ajax']);
        add_action('wp_ajax_css_utility_delete_all_classes', [$this, 'handle_delete_all_classes_ajax']);
        add_action('wp_ajax_css_utility_export_classes', [$this, 'handle_export_classes_ajax']);
        // Variables CRUD
        add_action('wp_ajax_css_variables_list', [$this, 'ajax_variables_list']);
        add_action('wp_ajax_css_variables_create', [$this, 'ajax_variables_create']);
        add_action('wp_ajax_css_variables_update', [$this, 'ajax_variables_update']);
        add_action('wp_ajax_css_variables_delete', [$this, 'ajax_variables_delete']);
        add_action('wp_ajax_css_variables_delete_all', [$this, 'ajax_variables_delete_all']);
    }
    
    private function init_components() {
        new CSSParser();
        new ClassMapper();
        
        // Only initialize ElementorIntegration if Elementor v4 features are available
        if (class_exists('Elementor\Modules\GlobalClasses\Global_Classes_Repository')) {
            $this->elementor_integration = new ElementorIntegration();
        }
        
        new AdminInterface();
    }
    
    public function add_admin_menu() {
        // Add as a top-level menu item for better accessibility
        // Use a data URI icon to avoid layout side-effects from external SVG dimensions/styles
        $icon_path = CSS_UTILITY_IMPORTER_PATH . 'skelementor.svg';
        $icon_url = CSS_UTILITY_IMPORTER_URL . 'skelementor.svg';
        if ( file_exists( $icon_path ) ) {
            $svg_raw = @file_get_contents( $icon_path );
            if ( false !== $svg_raw ) {
                $icon_url = 'data:image/svg+xml;base64,' . base64_encode( $svg_raw );
            }
        }

        add_menu_page(
            __('Skelementor', 'css-utility-importer'),
            __('Skelementor', 'css-utility-importer'),
            'manage_options',
            'css-utility-importer',
            [$this, 'admin_page'],
            $icon_url,
            30
        );
        
        // Also add as submenu under Elementor if Elementor is available
        if (class_exists('Elementor\Plugin')) {
            add_submenu_page(
                'elementor',
                __('Skelementor', 'css-utility-importer'),
                __('Skelementor', 'css-utility-importer'),
                'manage_options',
                'css-utility-importer',
                [$this, 'admin_page']
            );
        }
    }
    
    public function enqueue_admin_scripts($hook) {
        // Debug: Log the hook name to see what it actually is
        error_log('CSS Utility Importer: Admin hook: ' . $hook);
        
        // Check for both possible hook names
        if ('toplevel_page_css-utility-importer' !== $hook && 'elementor_page_css-utility-importer' !== $hook) {
            error_log('CSS Utility Importer: Hook does not match, not enqueuing scripts');
            return;
        }
        
        error_log('CSS Utility Importer: Enqueuing scripts for hook: ' . $hook);
        
        wp_enqueue_script(
            'css-utility-importer-admin',
            CSS_UTILITY_IMPORTER_URL . 'assets/js/admin.js',
            ['jquery', 'wp-util'],
            CSS_UTILITY_IMPORTER_VERSION,
            true
        );
        
        wp_enqueue_style(
            'css-utility-importer-admin',
            CSS_UTILITY_IMPORTER_URL . 'assets/css/admin.css',
            [],
            CSS_UTILITY_IMPORTER_VERSION
        );
        
        wp_localize_script('css-utility-importer-admin', 'cssUtilityImporter', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('css_utility_importer_nonce'),
            'strings' => [
                'importing' => __('Importing classes...', 'css-utility-importer'),
                'success' => __('Classes imported successfully!', 'css-utility-importer'),
                'error' => __('An error occurred during import.', 'css-utility-importer'),
                'parsing' => __('Parsing CSS file...', 'css-utility-importer'),
                'confirm_delete' => __('Are you sure you want to delete this class?', 'css-utility-importer'),
                'no_classes_selected' => __('No classes selected for export.', 'css-utility-importer'),
                'confirm_export' => __('Export selected classes?', 'css-utility-importer'),
                'export_success' => __('Classes exported successfully!', 'css-utility-importer'),
                'export_error' => __('An error occurred during export.', 'css-utility-importer'),
            ]
        ]);
    }
    
    public function admin_page() {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'css-utility-importer'));
        }
        
        $css_parser = new CSSParser();
        $class_mapper = new ClassMapper();
        $elementor_integration = $this->elementor_integration;
        
        $imported_classes = get_option('css_utility_importer_imported_classes', []);
        $settings = get_option('css_utility_importer_settings', []);
        
        include CSS_UTILITY_IMPORTER_PATH . 'templates/admin-page.php';
    }

    public function ajax_variables_list() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        if (!current_user_can('manage_options')) { wp_die(__('Insufficient permissions.', 'css-utility-importer')); }
        try {
            $vars = new VariablesIntegration();
            $res = $vars->list_variables();
            $res['success'] ? wp_send_json_success($res) : wp_send_json_error($res['message']);
        } catch (\Throwable $e) { wp_send_json_error($e->getMessage()); }
    }

    public function ajax_variables_create() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        if (!current_user_can('manage_options')) { wp_die(__('Insufficient permissions.', 'css-utility-importer')); }
        try {
            $type = sanitize_text_field($_POST['type'] ?? 'color');
            $label = sanitize_text_field($_POST['label'] ?? '');
            $value = wp_unslash($_POST['value'] ?? '');
            $vars = new VariablesIntegration();
            $res = $vars->create_variable($type, $label, $value);
            $res['success'] ? wp_send_json_success($res) : wp_send_json_error($res['message']);
        } catch (\Throwable $e) { wp_send_json_error($e->getMessage()); }
    }

    public function ajax_variables_update() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        if (!current_user_can('manage_options')) { wp_die(__('Insufficient permissions.', 'css-utility-importer')); }
        try {
            $id = sanitize_text_field($_POST['id'] ?? '');
            $payload = [];
            if (isset($_POST['label'])) { $payload['label'] = sanitize_text_field($_POST['label']); }
            if (isset($_POST['value'])) { $payload['value'] = wp_unslash($_POST['value']); }
            $vars = new VariablesIntegration();
            $res = $vars->update_variable($id, $payload);
            $res['success'] ? wp_send_json_success($res) : wp_send_json_error($res['message']);
        } catch (\Throwable $e) { wp_send_json_error($e->getMessage()); }
    }

    public function ajax_variables_delete() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        if (!current_user_can('manage_options')) { wp_die(__('Insufficient permissions.', 'css-utility-importer')); }
        try {
            $id = sanitize_text_field($_POST['id'] ?? '');
            $vars = new VariablesIntegration();
            $res = $vars->delete_variable($id);
            $res['success'] ? wp_send_json_success($res) : wp_send_json_error($res['message']);
        } catch (\Throwable $e) { wp_send_json_error($e->getMessage()); }
    }

    public function ajax_variables_delete_all() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        if (!current_user_can('manage_options')) { wp_die(__('Insufficient permissions.', 'css-utility-importer')); }
        try {
            $vars = new VariablesIntegration();
            $res = $vars->delete_all_variables();
            $res['success'] ? wp_send_json_success($res) : wp_send_json_error($res['message']);
        } catch (\Throwable $e) { wp_send_json_error($e->getMessage()); }
    }
    
    public function handle_import_ajax() {
        try {
            // Suppress deprecation warnings during AJAX to prevent JSON parsing errors
            error_reporting(E_ALL & ~E_DEPRECATED);
            ini_set('display_errors', 0);
            
            error_log('CSS Utility Importer: handle_import_ajax called');
            error_log('CSS Utility Importer: POST data: ' . print_r($_POST, true));
            
            // Check if all required classes exist
            $required_classes = [
                'CSSUtilityImporter\CSSParser',
                'CSSUtilityImporter\ClassMapper', 
                'CSSUtilityImporter\ElementorIntegration',
                'CSSUtilityImporter\VariablesIntegration'
            ];
            
            foreach ($required_classes as $class) {
                if (!class_exists($class)) {
                    error_log('CSS Utility Importer: Missing class: ' . $class);
                    wp_send_json_error('Missing required class: ' . $class);
                }
            }
            
            check_ajax_referer('css_utility_importer_nonce', 'nonce');
            
            if (!current_user_can('manage_options')) {
                wp_die(__('Insufficient permissions.', 'css-utility-importer'));
            }
            
            $css_content = sanitize_textarea_field($_POST['css_content'] ?? '');
            $file_name = sanitize_text_field($_POST['file_name'] ?? '');
            
            error_log('CSS Utility Importer: Starting import with CSS content length: ' . strlen($css_content));
            
            if (empty($css_content)) {
                wp_send_json_error(__('No CSS content provided.', 'css-utility-importer'));
            }
            
            // Check if classes exist
            if (!class_exists('CSSUtilityImporter\CSSParser')) {
                wp_send_json_error(__('CSSParser class not found.', 'css-utility-importer'));
            }
            
            $css_parser = new CSSParser();
            error_log('CSS Utility Importer: CSSParser created successfully');
            
            $parsed_classes = $css_parser->parse_css($css_content);
            error_log('CSS Utility Importer: Parsed ' . count($parsed_classes) . ' classes');

            // New: Extract :root variables and upsert supported ones (Elementor v4 supports: color, font)
            try {
                $rootVars = $css_parser->extract_root_variables($css_content);
                $varsIntegration = new VariablesIntegration();
                $createdOrUpdated = 0;
                foreach ($rootVars as $varName => $varValue) {
                    $label = ltrim(trim($varName), '-'); // strip leading `--`
                    $value = trim($varValue);
                    // Only create supported variable types
                    if (preg_match('/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/', $value)
                        || preg_match('/^rgba?\(/i', $value)
                        || preg_match('/^hsla?\(/i', $value)) {
                        $res = $varsIntegration->upsert_variable_by_label('global-color-variable', $label, $value);
                        if (!empty($res['success'])) { $createdOrUpdated++; }
                        continue;
                    }
                    // Heuristic font detection: contains commas or spaces with letters
                    if (preg_match('/[a-zA-Z]/', $value) && (strpos($value, ',') !== false || stripos($value, 'sans') !== false || stripos($value, 'serif') !== false)) {
                        $res = $varsIntegration->upsert_variable_by_label('global-font-variable', $label, $value);
                        if (!empty($res['success'])) { $createdOrUpdated++; }
                        continue;
                    }
                    // Skip unsupported variable types (spacing, radius, etc.) until Elementor adds support
                }
                error_log('CSS Utility Importer: Root variables processed: ' . $createdOrUpdated);
            } catch (\Throwable $e) {
                error_log('CSS Utility Importer: Root variables parse/upsert failed: ' . $e->getMessage());
            }
            
            if (empty($parsed_classes)) {
                wp_send_json_error(__('No utility classes found in the CSS file.', 'css-utility-importer'));
            }
            
            if (!class_exists('CSSUtilityImporter\ClassMapper')) {
                wp_send_json_error(__('ClassMapper class not found.', 'css-utility-importer'));
            }
            
            $class_mapper = new ClassMapper();
            error_log('CSS Utility Importer: ClassMapper created successfully');
            
            $mapped_classes = $class_mapper->map_to_elementor_format($parsed_classes);
            error_log('CSS Utility Importer: Mapped ' . count($mapped_classes) . ' classes to Elementor format');
            error_log('CSS Utility Importer: Mapped classes structure: ' . print_r($mapped_classes, true));

            // New: Also derive variables from parsed classes (colors only) and upsert
            try {
                $varsIntegration = new VariablesIntegration();
                $variablesCreated = 0;
                foreach ($parsed_classes as $name => $data) {
                    if (!empty($data['properties'])) {
                        foreach ($data['properties'] as $prop => $val) {
                            if ($prop === 'color' && is_string($val)) {
                                $value = trim($val);
                                if (preg_match('/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/', $value)
                                    || preg_match('/^rgba?\(/i', $value)
                                    || preg_match('/^hsla?\(/i', $value)) {
                                    // Create a color variable for this utility
                                    $label = substr(ltrim($name, '-'), 0, 50);
                                    $res = $varsIntegration->upsert_variable_by_label('global-color-variable', $label, $value);
                                    if (!empty($res['success'])) { $variablesCreated++; }
                                }
                            }
                        }
                    }
                }
                error_log('CSS Utility Importer: Variables processed: ' . $variablesCreated);
            } catch (\Throwable $e) {
                error_log('CSS Utility Importer: Variables upsert failed: ' . $e->getMessage());
            }
            
            if (!class_exists('CSSUtilityImporter\ElementorIntegration')) {
                wp_send_json_error(__('ElementorIntegration class not found.', 'css-utility-importer'));
            }
            
            if (!class_exists('Elementor\Modules\GlobalClasses\Global_Classes_Repository')) {
                wp_send_json_error(__('Elementor v4 Global Classes not available. Please enable the Global Classes experiment in Elementor settings.', 'css-utility-importer'));
            }
            
            $elementor_integration = $this->elementor_integration;
            if (!$elementor_integration) {
                error_log('CSS Utility Importer: ElementorIntegration not available');
                wp_send_json_error(__('ElementorIntegration not available.', 'css-utility-importer'));
            }
            
            error_log('CSS Utility Importer: Starting Elementor import');
            $import_result = $elementor_integration->import_classes($mapped_classes, $file_name);
            error_log('CSS Utility Importer: Import result: ' . print_r($import_result, true));
            
            if ($import_result['success']) {
                wp_send_json_success([
                    'message' => sprintf(__('Successfully imported %d classes.', 'css-utility-importer'), count($mapped_classes)),
                    'classes' => $mapped_classes
                ]);
            } else {
                wp_send_json_error($import_result['message']);
            }
        } catch (\Exception $e) {
            error_log('CSS Utility Importer: Import failed: ' . $e->getMessage());
            error_log('CSS Utility Importer: Import error trace: ' . $e->getTraceAsString());
            wp_send_json_error(__('Error: ', 'css-utility-importer') . $e->getMessage());
        } catch (\Error $e) {
            error_log('CSS Utility Importer: Fatal error during import: ' . $e->getMessage());
            error_log('CSS Utility Importer: Fatal error trace: ' . $e->getTraceAsString());
            wp_send_json_error(__('Fatal error during import: ', 'css-utility-importer') . $e->getMessage());
        }
    }
    
    public function handle_parse_ajax() {
        try {
            // Suppress deprecation warnings during AJAX to prevent JSON parsing errors
            error_reporting(E_ALL & ~E_DEPRECATED);
            ini_set('display_errors', 0);
            
            check_ajax_referer('css_utility_importer_nonce', 'nonce');
            
            if (!current_user_can('manage_options')) {
                wp_die(__('Insufficient permissions.', 'css-utility-importer'));
            }
            
            $css_content = sanitize_textarea_field($_POST['css_content'] ?? '');
            
            if (empty($css_content)) {
                wp_send_json_error(__('No CSS content provided.', 'css-utility-importer'));
            }
            
            if (!class_exists('CSSUtilityImporter\CSSParser')) {
                wp_send_json_error(__('CSSParser class not found.', 'css-utility-importer'));
            }
            
            $css_parser = new CSSParser();
            $parsed_classes = $css_parser->parse_css($css_content);
            // Prefer :root variables, but also capture any custom properties as fallback
            $root_variables = $css_parser->extract_root_variables($css_content);
            if (empty($root_variables)) {
                $root_variables = $css_parser->extract_all_variables($css_content);
            }
            
            // Convert associative array to numeric array for template
            $classes_array = array_values($parsed_classes);
            
            // Convert properties to the format expected by the template
            foreach ($classes_array as &$class) {
                if (isset($class['properties']) && is_array($class['properties'])) {
                    $properties_array = [];
                    foreach ($class['properties'] as $key => $value) {
                        $properties_array[] = [
                            'key' => $key,
                            'value' => $value
                        ];
                    }
                    $class['properties'] = $properties_array;
                }
            }
            
            // Variables preview array
            $variables_array = [];
            foreach ($root_variables as $name => $value) {
                $variables_array[] = [ 'name' => $name, 'value' => $value ];
            }
            
            wp_send_json_success([
                'classes' => $classes_array,
                'count' => count($parsed_classes),
                'variables' => $variables_array,
                'variables_count' => count($variables_array)
            ]);
        } catch (\Exception $e) {
            wp_send_json_error(__('Error: ', 'css-utility-importer') . $e->getMessage());
        }
    }
    
    public function handle_sync_ajax() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        $elementor_integration = $this->elementor_integration;
        if (!$elementor_integration) {
            wp_send_json_error(__('ElementorIntegration not available.', 'css-utility-importer'));
        }
        $sync_result = $elementor_integration->sync_with_elementor();
        
        if ($sync_result['success']) {
            wp_send_json_success($sync_result);
        } else {
            wp_send_json_error($sync_result['message']);
        }
    }
    
    public function handle_get_classes_ajax() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        $elementor_integration = $this->elementor_integration;
        if (!$elementor_integration) {
            wp_send_json_error(__('ElementorIntegration not available.', 'css-utility-importer'));
        }
        
        $result = $elementor_integration->get_elementor_classes();
        
        if ($result['success']) {
            wp_send_json_success([
                'classes' => $result['classes'],
                'order' => $result['order']
            ]);
        } else {
            wp_send_json_error($result['message']);
        }
    }
    
    public function handle_delete_class_ajax() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        $class_id = sanitize_text_field($_POST['class_id'] ?? '');
        
        if (empty($class_id)) {
            wp_send_json_error(__('Class ID is required.', 'css-utility-importer'));
        }
        
        $elementor_integration = $this->elementor_integration;
        if (!$elementor_integration) {
            wp_send_json_error(__('ElementorIntegration not available.', 'css-utility-importer'));
        }
        
        $result = $elementor_integration->delete_class($class_id);
        
        if ($result['success']) {
            wp_send_json_success($result['message']);
        } else {
            wp_send_json_error($result['message']);
        }
    }
    
    public function handle_delete_all_classes_ajax() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        $elementor_integration = $this->elementor_integration;
        if (!$elementor_integration) {
            wp_send_json_error(__('ElementorIntegration not available.', 'css-utility-importer'));
        }
        
        $result = $elementor_integration->delete_all_classes();
        
        if ($result['success']) {
            wp_send_json_success($result['message']);
        } else {
            wp_send_json_error($result['message']);
        }
    }
    
    public function handle_export_classes_ajax() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        $class_ids = array_map('sanitize_text_field', $_POST['class_ids'] ?? []);
        
        $elementor_integration = $this->elementor_integration;
        if (!$elementor_integration) {
            wp_send_json_error(__('ElementorIntegration not available.', 'css-utility-importer'));
        }
        
        $result = $elementor_integration->export_classes($class_ids);
        
        if ($result['success']) {
            // Create a temporary file for download
            $filename = 'elementor-global-classes-' . date('Y-m-d-H-i-s') . '.json';
            $file_content = json_encode([
                'classes' => $result['classes'],
                'exported_at' => current_time('mysql'),
                'count' => $result['count']
            ], JSON_PRETTY_PRINT);
            
            // For now, return the data directly (you could implement file download later)
            wp_send_json_success([
                'classes' => $result['classes'],
                'count' => $result['count'],
                'filename' => $filename,
                'download_url' => '#', // Placeholder
                'message' => sprintf(__('Exported %d classes successfully.', 'css-utility-importer'), $result['count'])
            ]);
        } else {
            wp_send_json_error($result['message']);
        }
    }
}
