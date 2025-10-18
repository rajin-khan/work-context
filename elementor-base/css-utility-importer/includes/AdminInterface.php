<?php

namespace CSSUtilityImporter;

class AdminInterface {
    
    public function __construct() {
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
        add_action('wp_ajax_css_utility_get_classes', [$this, 'ajax_get_classes']);
        add_action('wp_ajax_css_utility_delete_class', [$this, 'ajax_delete_class']);
        add_action('wp_ajax_css_utility_delete_all_classes', [$this, 'ajax_delete_all_classes']);
        add_action('wp_ajax_css_utility_export_classes', [$this, 'ajax_export_classes']);
    }
    
    public function enqueue_admin_scripts($hook) {
        // Check for both possible hook names
        if ('toplevel_page_css-utility-importer' !== $hook && 'elementor_page_css-utility-importer' !== $hook) {
            return;
        }
        
        wp_enqueue_script(
            'css-utility-importer-admin',
            CSS_UTILITY_IMPORTER_URL . 'assets/js/admin.js',
            ['jquery', 'wp-util', 'wp-i18n'],
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
                'confirm_export' => __('Export selected classes?', 'css-utility-importer'),
                'no_classes_selected' => __('Please select classes to export.', 'css-utility-importer'),
                'export_success' => __('Classes exported successfully!', 'css-utility-importer'),
                'export_error' => __('Export failed.', 'css-utility-importer'),
            ]
        ]);
    }
    
    public function render_admin_page() {
        $elementor_integration = new ElementorIntegration();
        $imported_classes = $elementor_integration->get_imported_classes();
        $elementor_classes = $elementor_integration->get_elementor_classes();
        
        include CSS_UTILITY_IMPORTER_PATH . 'templates/admin-page.php';
    }
    
    public function ajax_get_classes() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        try {
            $elementor_integration = new ElementorIntegration();
            $result = $elementor_integration->get_elementor_classes();
            
            if ($result['success']) {
                wp_send_json_success($result);
            } else {
                wp_send_json_error($result['message']);
            }
        } catch (\Exception $e) {
            error_log('CSS Utility Importer: Get classes error: ' . $e->getMessage());
            wp_send_json_error(__('Error getting classes: ', 'css-utility-importer') . $e->getMessage());
        }
    }
    
    public function ajax_delete_class() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        $class_id = sanitize_text_field($_POST['class_id'] ?? '');
        
        if (empty($class_id)) {
            wp_send_json_error(__('Class ID is required.', 'css-utility-importer'));
        }
        
        try {
            $elementor_integration = new ElementorIntegration();
            $result = $elementor_integration->delete_class($class_id);
            
            if ($result['success']) {
                wp_send_json_success($result);
            } else {
                wp_send_json_error($result['message']);
            }
        } catch (\Exception $e) {
            error_log('CSS Utility Importer: Delete class error: ' . $e->getMessage());
            wp_send_json_error(__('Error deleting class: ', 'css-utility-importer') . $e->getMessage());
        }
    }
    
    public function ajax_delete_all_classes() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        try {
            $elementor_integration = new ElementorIntegration();
            $result = $elementor_integration->delete_all_classes();
            
            if ($result['success']) {
                wp_send_json_success($result);
            } else {
                wp_send_json_error($result['message']);
            }
        } catch (\Exception $e) {
            error_log('CSS Utility Importer: Delete all classes error: ' . $e->getMessage());
            wp_send_json_error(__('Error deleting all classes: ', 'css-utility-importer') . $e->getMessage());
        }
    }
    
    public function ajax_export_classes() {
        check_ajax_referer('css_utility_importer_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'css-utility-importer'));
        }
        
        $class_ids = array_map('sanitize_text_field', $_POST['class_ids'] ?? []);
        
        if (empty($class_ids)) {
            wp_send_json_error(__('No classes selected for export.', 'css-utility-importer'));
        }
        
        $elementor_integration = new ElementorIntegration();
        $result = $elementor_integration->export_classes($class_ids);
        
        if ($result['success']) {
            // Create export file
            $export_data = [
                'version' => CSS_UTILITY_IMPORTER_VERSION,
                'exported_at' => current_time('mysql'),
                'classes' => $result['classes']
            ];
            
            $filename = 'css-utility-classes-' . date('Y-m-d-H-i-s') . '.json';
            $file_path = wp_upload_dir()['path'] . '/' . $filename;
            
            file_put_contents($file_path, wp_json_encode($export_data, JSON_PRETTY_PRINT));
            
            wp_send_json_success([
                'message' => $result['message'],
                'download_url' => wp_upload_dir()['url'] . '/' . $filename,
                'filename' => $filename
            ]);
        } else {
            wp_send_json_error($result['message']);
        }
    }
}
