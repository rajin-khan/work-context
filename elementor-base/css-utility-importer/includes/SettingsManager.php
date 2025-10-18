<?php

namespace CSSUtilityImporter;

class SettingsManager {
    
    private $settings_option = 'css_utility_importer_settings';
    private $default_settings = [
        'auto_import' => false,
        'import_frequency' => 'manual',
        'css_files' => [],
        'imported_classes' => [],
        'custom_patterns' => [],
        'property_mappings' => [],
        'value_converters' => [],
        'exclude_patterns' => [],
        'include_patterns' => [],
        'class_prefix' => '',
        'class_suffix' => '',
        'backup_enabled' => true,
        'backup_frequency' => 'daily',
        'last_backup' => null,
        'version' => CSS_UTILITY_IMPORTER_VERSION
    ];
    
    public function __construct() {
        add_action('admin_init', [$this, 'register_settings']);
        add_action('wp_ajax_css_utility_save_settings', [$this, 'ajax_save_settings']);
        add_action('wp_ajax_css_utility_reset_settings', [$this, 'ajax_reset_settings']);
        add_action('wp_ajax_css_utility_export_settings', [$this, 'ajax_export_settings']);
        add_action('wp_ajax_css_utility_import_settings', [$this, 'ajax_import_settings']);
    }
    
    public function register_settings() {
        register_setting(
            'css_utility_importer_settings',
            $this->settings_option,
            [
                'sanitize_callback' => [$this, 'sanitize_settings'],
                'default' => $this->default_settings
            ]
        );
    }
    
    public function get_settings() {
        $settings = get_option($this->settings_option, $this->default_settings);
        return wp_parse_args($settings, $this->default_settings);
    }
    
    public function update_settings($new_settings) {
        $current_settings = $this->get_settings();
        $updated_settings = wp_parse_args($new_settings, $current_settings);
        
        return update_option($this->settings_option, $updated_settings);
    }
    
    public function reset_settings() {
        return update_option($this->settings_option, $this->default_settings);
    }
    
    public function sanitize_settings($input) {
        $sanitized = [];
        
        // Auto import
        $sanitized['auto_import'] = (bool) ($input['auto_import'] ?? false);
        
        // Import frequency
        $sanitized['import_frequency'] = sanitize_text_field($input['import_frequency'] ?? 'manual');
        if (!in_array($sanitized['import_frequency'], ['manual', 'hourly', 'daily', 'weekly'])) {
            $sanitized['import_frequency'] = 'manual';
        }
        
        // CSS files
        $sanitized['css_files'] = [];
        if (isset($input['css_files']) && is_array($input['css_files'])) {
            foreach ($input['css_files'] as $file) {
                $sanitized['css_files'][] = [
                    'name' => sanitize_text_field($file['name'] ?? ''),
                    'url' => esc_url_raw($file['url'] ?? ''),
                    'last_modified' => sanitize_text_field($file['last_modified'] ?? ''),
                    'enabled' => (bool) ($file['enabled'] ?? true)
                ];
            }
        }
        
        // Custom patterns
        $sanitized['custom_patterns'] = [];
        if (isset($input['custom_patterns']) && is_array($input['custom_patterns'])) {
            foreach ($input['custom_patterns'] as $pattern) {
                $sanitized['custom_patterns'][] = [
                    'name' => sanitize_text_field($pattern['name'] ?? ''),
                    'pattern' => sanitize_text_field($pattern['pattern'] ?? ''),
                    'property' => sanitize_text_field($pattern['property'] ?? ''),
                    'enabled' => (bool) ($pattern['enabled'] ?? true)
                ];
            }
        }
        
        // Property mappings
        $sanitized['property_mappings'] = [];
        if (isset($input['property_mappings']) && is_array($input['property_mappings'])) {
            foreach ($input['property_mappings'] as $mapping) {
                $sanitized['property_mappings'][] = [
                    'css_property' => sanitize_text_field($mapping['css_property'] ?? ''),
                    'elementor_property' => sanitize_text_field($mapping['elementor_property'] ?? ''),
                    'enabled' => (bool) ($mapping['enabled'] ?? true)
                ];
            }
        }
        
        // Value converters
        $sanitized['value_converters'] = [];
        if (isset($input['value_converters']) && is_array($input['value_converters'])) {
            foreach ($input['value_converters'] as $converter) {
                $sanitized['value_converters'][] = [
                    'property' => sanitize_text_field($converter['property'] ?? ''),
                    'converter' => sanitize_text_field($converter['converter'] ?? ''),
                    'enabled' => (bool) ($converter['enabled'] ?? true)
                ];
            }
        }
        
        // Exclude patterns
        $sanitized['exclude_patterns'] = [];
        if (isset($input['exclude_patterns']) && is_array($input['exclude_patterns'])) {
            foreach ($input['exclude_patterns'] as $pattern) {
                $sanitized['exclude_patterns'][] = sanitize_text_field($pattern);
            }
        }
        
        // Include patterns
        $sanitized['include_patterns'] = [];
        if (isset($input['include_patterns']) && is_array($input['include_patterns'])) {
            foreach ($input['include_patterns'] as $pattern) {
                $sanitized['include_patterns'][] = sanitize_text_field($pattern);
            }
        }
        
        // Class prefix and suffix
        $sanitized['class_prefix'] = sanitize_text_field($input['class_prefix'] ?? '');
        $sanitized['class_suffix'] = sanitize_text_field($input['class_suffix'] ?? '');
        
        // Backup settings
        $sanitized['backup_enabled'] = (bool) ($input['backup_enabled'] ?? true);
        $sanitized['backup_frequency'] = sanitize_text_field($input['backup_frequency'] ?? 'daily');
        if (!in_array($sanitized['backup_frequency'], ['hourly', 'daily', 'weekly', 'monthly'])) {
            $sanitized['backup_frequency'] = 'daily';
        }
        
        // Version
        $sanitized['version'] = CSS_UTILITY_IMPORTER_VERSION;
        
        return $sanitized;
    }
    
    public function ajax_save_settings() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        $settings = $_POST['settings'] ?? [];
        $result = $this->update_settings($settings);
        
        if ($result) {
            wp_send_json_success([
                'message' => __('Settings saved successfully.', 'css-utility-importer')
            ]);
        } else {
            wp_send_json_error([
                'message' => __('Failed to save settings.', 'css-utility-importer')
            ]);
        }
    }
    
    public function ajax_reset_settings() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        $result = $this->reset_settings();
        
        if ($result) {
            wp_send_json_success([
                'message' => __('Settings reset to defaults.', 'css-utility-importer')
            ]);
        } else {
            wp_send_json_error([
                'message' => __('Failed to reset settings.', 'css-utility-importer')
            ]);
        }
    }
    
    public function ajax_export_settings() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        $settings = $this->get_settings();
        $export_data = [
            'version' => CSS_UTILITY_IMPORTER_VERSION,
            'exported_at' => current_time('mysql'),
            'settings' => $settings
        ];
        
        $filename = 'css-utility-importer-settings-' . date('Y-m-d-H-i-s') . '.json';
        $file_path = wp_upload_dir()['path'] . '/' . $filename;
        
        $result = file_put_contents($file_path, wp_json_encode($export_data, JSON_PRETTY_PRINT));
        
        if ($result !== false) {
            wp_send_json_success([
                'download_url' => wp_upload_dir()['url'] . '/' . $filename,
                'filename' => $filename
            ]);
        } else {
            wp_send_json_error([
                'message' => __('Failed to export settings.', 'css-utility-importer')
            ]);
        }
    }
    
    public function ajax_import_settings() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        if (!isset($_FILES['settings_file']) || $_FILES['settings_file']['error'] !== UPLOAD_ERR_OK) {
            wp_send_json_error([
                'message' => __('No file uploaded or upload error.', 'css-utility-importer')
            ]);
        }
        
        $file_content = file_get_contents($_FILES['settings_file']['tmp_name']);
        $import_data = json_decode($file_content, true);
        
        if (!$import_data || !isset($import_data['settings'])) {
            wp_send_json_error([
                'message' => __('Invalid settings file format.', 'css-utility-importer')
            ]);
        }
        
        $result = $this->update_settings($import_data['settings']);
        
        if ($result) {
            wp_send_json_success([
                'message' => __('Settings imported successfully.', 'css-utility-importer')
            ]);
        } else {
            wp_send_json_error([
                'message' => __('Failed to import settings.', 'css-utility-importer')
            ]);
        }
    }
    
    public function get_css_files() {
        $settings = $this->get_settings();
        return $settings['css_files'] ?? [];
    }
    
    public function add_css_file($file_data) {
        $settings = $this->get_settings();
        $settings['css_files'][] = $file_data;
        return $this->update_settings($settings);
    }
    
    public function remove_css_file($index) {
        $settings = $this->get_settings();
        if (isset($settings['css_files'][$index])) {
            unset($settings['css_files'][$index]);
            $settings['css_files'] = array_values($settings['css_files']);
            return $this->update_settings($settings);
        }
        return false;
    }
    
    public function get_custom_patterns() {
        $settings = $this->get_settings();
        return $settings['custom_patterns'] ?? [];
    }
    
    public function add_custom_pattern($pattern_data) {
        $settings = $this->get_settings();
        $settings['custom_patterns'][] = $pattern_data;
        return $this->update_settings($settings);
    }
    
    public function get_property_mappings() {
        $settings = $this->get_settings();
        return $settings['property_mappings'] ?? [];
    }
    
    public function add_property_mapping($mapping_data) {
        $settings = $this->get_settings();
        $settings['property_mappings'][] = $mapping_data;
        return $this->update_settings($settings);
    }
    
    public function get_exclude_patterns() {
        $settings = $this->get_settings();
        return $settings['exclude_patterns'] ?? [];
    }
    
    public function get_include_patterns() {
        $settings = $this->get_settings();
        return $settings['include_patterns'] ?? [];
    }
    
    public function should_auto_import() {
        $settings = $this->get_settings();
        return $settings['auto_import'] ?? false;
    }
    
    public function get_import_frequency() {
        $settings = $this->get_settings();
        return $settings['import_frequency'] ?? 'manual';
    }
    
    public function get_class_prefix() {
        $settings = $this->get_settings();
        return $settings['class_prefix'] ?? '';
    }
    
    public function get_class_suffix() {
        $settings = $this->get_settings();
        return $settings['class_suffix'] ?? '';
    }
    
    public function is_backup_enabled() {
        $settings = $this->get_settings();
        return $settings['backup_enabled'] ?? true;
    }
    
    public function get_backup_frequency() {
        $settings = $this->get_settings();
        return $settings['backup_frequency'] ?? 'daily';
    }
    
    public function create_backup() {
        if (!$this->is_backup_enabled()) {
            return false;
        }
        
        $settings = $this->get_settings();
        $elementor_integration = new ElementorIntegration();
        $classes = $elementor_integration->get_elementor_classes();
        
        $backup_data = [
            'version' => CSS_UTILITY_IMPORTER_VERSION,
            'backup_at' => current_time('mysql'),
            'settings' => $settings,
            'classes' => $classes['classes'] ?? []
        ];
        
        $filename = 'css-utility-backup-' . date('Y-m-d-H-i-s') . '.json';
        $file_path = wp_upload_dir()['path'] . '/' . $filename;
        
        $result = file_put_contents($file_path, wp_json_encode($backup_data, JSON_PRETTY_PRINT));
        
        if ($result !== false) {
            $settings['last_backup'] = current_time('mysql');
            $this->update_settings($settings);
            return $file_path;
        }
        
        return false;
    }
    
    public function restore_from_backup($backup_file) {
        if (!file_exists($backup_file)) {
            return false;
        }
        
        $backup_content = file_get_contents($backup_file);
        $backup_data = json_decode($backup_content, true);
        
        if (!$backup_data || !isset($backup_data['settings']) || !isset($backup_data['classes'])) {
            return false;
        }
        
        // Restore settings
        $this->update_settings($backup_data['settings']);
        
        // Restore classes
        $elementor_integration = new ElementorIntegration();
        $result = $elementor_integration->import_from_export($backup_data);
        
        return $result['success'] ?? false;
    }
}
