<?php

namespace CSSUtilityImporter;

use Elementor\Plugin;

class GlobalClassesAPIClient {
    
    private $api_base = '/wp-json/elementor/v1/global-classes';
    private $api_namespace = 'elementor/v1';
    
    public function __construct() {
        // Check if Elementor is active and has global classes module
        if (!class_exists('Elementor\Plugin')) {
            throw new \Exception('Elementor plugin is not active.');
        }
        
        // Check if global classes module is available (more lenient check)
        if (!class_exists('Elementor\Modules\GlobalClasses\Module') && !class_exists('Elementor\Modules\GlobalClasses\Global_Classes_REST_API')) {
            // Don't throw exception here, just log a warning
            error_log('CSS Utility Importer - Elementor Global Classes module may not be available yet.');
        }
        
        // Check basic WordPress capabilities (more lenient check)
        if (!current_user_can('edit_posts')) {
            throw new \Exception('Insufficient permissions to manage global classes.');
        }
    }
    
    /**
     * Test if the API endpoint is available and working
     * Call this method when you need to test the API, not in constructor
     */
    public function test_api_availability() {
        try {
            $request = new \WP_REST_Request('GET', '/' . $this->api_namespace . '/global-classes');
            $request->set_param('context', 'frontend');
            $response = rest_do_request($request);
            
            if (is_wp_error($response)) {
                error_log('CSS Utility Importer - API Test Failed: ' . $response->get_error_message());
                return false;
            } else {
                error_log('CSS Utility Importer - API Test Success: Status ' . $response->get_status());
                return true;
            }
        } catch (\Exception $e) {
            error_log('CSS Utility Importer - API Test Exception: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Validate payload before sending to API
     */
    private function validate_payload($items, $order, $changes, $context) {
        // Validate context
        if (!in_array($context, ['frontend', 'preview'], true)) {
            throw new \Exception('Invalid context. Must be "frontend" or "preview".');
        }
        
        // Validate changes structure
        if (!is_array($changes)) {
            throw new \Exception('Changes must be an array.');
        }
        
        $required_change_keys = ['added', 'deleted', 'modified'];
        foreach ($required_change_keys as $key) {
            if (!array_key_exists($key, $changes)) {
                throw new \Exception('Changes array must contain "' . $key . '" key.');
            }
            if (!is_array($changes[$key])) {
                throw new \Exception('Changes "' . $key . '" must be an array.');
            }
        }
        
        // Validate items structure
        if (!is_array($items)) {
            throw new \Exception('Items must be an array.');
        }
        
        // Validate order
        if (!is_array($order)) {
            throw new \Exception('Order must be an array.');
        }
        
        // Check if order matches items keys
        $item_keys = array_keys($items);
        $order_diff = array_diff($order, $item_keys);
        if (!empty($order_diff)) {
            error_log('CSS Utility Importer - Warning: Order contains keys not in items: ' . implode(', ', $order_diff));
        }
        
        // Validate each item structure
        foreach ($items as $item_id => $item) {
            if (!is_array($item)) {
                throw new \Exception('Item ' . $item_id . ' must be an array.');
            }
            
            $required_item_keys = ['id', 'label', 'type', 'variants'];
            foreach ($required_item_keys as $key) {
                if (!array_key_exists($key, $item)) {
                    throw new \Exception('Item ' . $item_id . ' must contain "' . $key . '" key.');
                }
            }
            
            // Validate variants
            if (!is_array($item['variants'])) {
                throw new \Exception('Item ' . $item_id . ' variants must be an array.');
            }
            
            foreach ($item['variants'] as $variant_index => $variant) {
                if (!is_array($variant)) {
                    throw new \Exception('Item ' . $item_id . ' variant ' . $variant_index . ' must be an array.');
                }
                
                if (!array_key_exists('meta', $variant) || !array_key_exists('props', $variant)) {
                    throw new \Exception('Item ' . $item_id . ' variant ' . $variant_index . ' must contain "meta" and "props" keys.');
                }
            }
        }
        
        error_log('CSS Utility Importer - Payload validation passed');
    }
    
    /**
     * Get all global classes for a specific context
     * 
     * @param string $context 'frontend' or 'preview'
     * @return array Response data
     */
    public function get_all($context = 'frontend') {
        // Ensure Elementor is fully loaded
        if (!did_action('elementor/loaded')) {
            throw new \Exception('Elementor is not fully loaded yet. Please try again later.');
        }
        
        $request = new \WP_REST_Request('GET', '/' . $this->api_namespace . '/global-classes');
        $request->set_param('context', $context);
        
        $response = rest_do_request($request);
        
        if (is_wp_error($response)) {
            throw new \Exception('Failed to fetch global classes: ' . $response->get_error_message());
        }
        
        $status_code = $response->get_status();
        $data = $response->get_data();
        
        if ($status_code !== 200) {
            $error_message = $data['message'] ?? 'Unknown error occurred';
            throw new \Exception('API Error: ' . $error_message);
        }
        
        return $data;
    }
    
    /**
     * Save classes using the REST API with proper change tracking
     * 
     * @param array $items Class items
     * @param array $order Class order
     * @param array $changes Change tracking
     * @param string $context 'frontend' or 'preview'
     * @return array Response data
     */
    public function save_classes($items, $order, $changes, $context = 'frontend') {
        // Ensure Elementor is fully loaded
        if (!did_action('elementor/loaded')) {
            throw new \Exception('Elementor is not fully loaded yet. Please try again later.');
        }
        
        // Use internal REST API instead of external HTTP request
        $request = new \WP_REST_Request('PUT', '/' . $this->api_namespace . '/global-classes');
        $request->set_param('context', $context);
        $request->set_param('changes', $changes);
        $request->set_param('items', $items);
        $request->set_param('order', $order);
        
        // Validate payload before sending
        $this->validate_payload($items, $order, $changes, $context);
        
        // Debug logging
        error_log('CSS Utility Importer - Payload: ' . json_encode([
            'context' => $context,
            'changes' => $changes,
            'items' => $items,
            'order' => $order
        ], JSON_PRETTY_PRINT));
        
        $response = rest_do_request($request);
        
        if (is_wp_error($response)) {
            throw new \Exception('Failed to save global classes: ' . $response->get_error_message());
        }
        
        $status_code = $response->get_status();
        $data = $response->get_data();
        
        // Debug logging
        error_log('CSS Utility Importer - API Response Status: ' . $status_code);
        error_log('CSS Utility Importer - API Response Data: ' . json_encode($data, JSON_PRETTY_PRINT));
        
        if ($status_code === 204) {
            // Success - no content response
            return [
                'success' => true,
                'message' => 'Classes saved successfully'
            ];
        }
        
        if ($status_code >= 400) {
            $error_message = $data['message'] ?? 'Unknown error occurred';
            $error_code = $data['code'] ?? 'unknown_error';
            
            // Handle specific validation errors
            if ($error_code === 'invalid_items' && isset($data['data']['errors'])) {
                $validation_errors = $this->format_validation_errors($data['data']['errors']);
                throw new \Exception('Validation failed: ' . $validation_errors);
            }
            
            if ($error_code === 'global_classes_limit_exceeded') {
                throw new \Exception('Global classes limit exceeded. Maximum allowed: 50');
            }
            
            // For internal server errors, provide more context
            if ($status_code >= 500) {
                throw new \Exception('API Error (internal_server_error): Server encountered an error. Check server logs for details.');
            }
            
            throw new \Exception('API Error (' . $error_code . '): ' . $error_message);
        }
        
        return $data;
    }
    
    /**
     * Publish classes to frontend (save to frontend context)
     * 
     * @param array $items Class items
     * @param array $order Class order
     * @param array $changes Change tracking
     * @return array Response data
     */
    public function publish_classes($items, $order, $changes) {
        return $this->save_classes($items, $order, $changes, 'frontend');
    }
    
    /**
     * Save classes as draft (save to preview context)
     * 
     * @param array $items Class items
     * @param array $order Class order
     * @param array $changes Change tracking
     * @return array Response data
     */
    public function save_draft($items, $order, $changes) {
        return $this->save_classes($items, $order, $changes, 'preview');
    }
    
    /**
     * Get usage statistics for global classes
     * 
     * @param string $context 'frontend' or 'preview'
     * @return array Usage data
     */
    public function get_usage($context = 'frontend') {
        // Ensure Elementor is fully loaded
        if (!did_action('elementor/loaded')) {
            throw new \Exception('Elementor is not fully loaded yet. Please try again later.');
        }
        
        $request = new \WP_REST_Request('GET', '/' . $this->api_namespace . '/global-classes/usage');
        $request->set_param('context', $context);
        
        $response = rest_do_request($request);
        
        if (is_wp_error($response)) {
            throw new \Exception('Failed to fetch usage data: ' . $response->get_error_message());
        }
        
        $status_code = $response->get_status();
        $data = $response->get_data();
        
        if ($status_code !== 200) {
            $error_message = $data['message'] ?? 'Unknown error occurred';
            throw new \Exception('API Error: ' . $error_message);
        }
        
        return $data;
    }
    
    /**
     * Format validation errors for display
     * 
     * @param array $errors Validation errors from API
     * @return string Formatted error message
     */
    private function format_validation_errors($errors) {
        $formatted_errors = [];
        
        foreach ($errors as $item_id => $item_errors) {
            if (is_array($item_errors)) {
                foreach ($item_errors as $field => $field_errors) {
                    if (is_array($field_errors)) {
                        $formatted_errors[] = sprintf(
                            'Class "%s" - %s: %s',
                            $item_id,
                            $field,
                            implode(', ', $field_errors)
                        );
                    } else {
                        $formatted_errors[] = sprintf(
                            'Class "%s" - %s: %s',
                            $item_id,
                            $field,
                            $field_errors
                        );
                    }
                }
            } else {
                $formatted_errors[] = sprintf('Class "%s": %s', $item_id, $item_errors);
            }
        }
        
        return implode('; ', $formatted_errors);
    }
    
    /**
     * Check if the API is available and accessible
     * 
     * @return bool True if API is available
     */
    public function is_api_available() {
        try {
            $this->get_all('frontend');
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
    
    /**
     * Get current class count
     * 
     * @param string $context 'frontend' or 'preview'
     * @return int Number of classes
     */
    public function get_class_count($context = 'frontend') {
        try {
            $data = $this->get_all($context);
            return count($data['data'] ?? []);
        } catch (\Exception $e) {
            return 0;
        }
    }
}
