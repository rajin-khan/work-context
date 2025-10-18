<?php

namespace CSSUtilityImporter;

use Elementor\Plugin;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;

class ElementorIntegration {
    
    private $repository;
    private $styles_manager;
    private $api_client;
    
    public function __construct() {
        // Check if Elementor v4 Global Classes is available
        if (!class_exists('Elementor\Modules\GlobalClasses\Global_Classes_Repository')) {
            throw new \Exception('Elementor v4 Global Classes module is not available. Please enable the Global Classes experiment in Elementor settings.');
        }
        
        $this->repository = new Global_Classes_Repository();
        $this->styles_manager = Atomic_Styles_Manager::instance();
        $this->api_client = new GlobalClassesAPIClient();
        
        // Register hooks for cache invalidation
        $this->register_style_provider_hooks();
    }
    
    private function register_style_provider_hooks() {
        // Register cache invalidation hooks
        add_action('elementor/global_classes/update', [$this, 'invalidate_utility_styles_cache'], 10, 1);
        add_action('elementor/core/files/clear_cache', [$this, 'invalidate_utility_styles_cache']);
    }
    
    public function invalidate_utility_styles_cache($context = null) {
        // Invalidate the cache for global styles (same as Elementor's approach)
        if (class_exists('Elementor\Modules\AtomicWidgets\Cache_Validity')) {
            $cache_validity = new \Elementor\Modules\AtomicWidgets\Cache_Validity();
            
            if (empty($context) || Global_Classes_Repository::CONTEXT_FRONTEND === $context) {
                $cache_validity->invalidate(['global']);
                return;
            }
            
            $cache_validity->invalidate(['global', $context]);
        }
    }
    
    public function import_classes($mapped_classes, $file_name = '') {
        try {
            error_log('CSS Utility Importer: ElementorIntegration::import_classes called with ' . count($mapped_classes) . ' classes');
            error_log('CSS Utility Importer: Mapped classes structure: ' . print_r($mapped_classes, true));
            
            // Get current classes for merging
            $current_classes = $this->repository->context('frontend')->all();
            $current_items = $current_classes->get_items()->all();
            $current_order = $current_classes->get_order()->all();
            
            error_log('CSS Utility Importer: Current classes count: ' . count($current_items));
            error_log('CSS Utility Importer: Current items structure: ' . print_r($current_items, true));
            
            // Compute ids to add and batch them to respect REST MAX_ITEMS (50)
            $ids_to_add = array_keys($mapped_classes);
            $batches = array_chunk($ids_to_add, 50);

            foreach ($batches as $batch) {
                $batch_items = [];
                foreach ($batch as $id) {
                    $batch_items[$id] = $mapped_classes[$id];
                }

                // Build order payload preserving current order and appending new ids in this batch
                $order_payload = $current_order;
                foreach ($batch as $id) {
                    if (!in_array($id, $order_payload, true)) {
                        $order_payload[] = $id;
                    }
                }

                $changes = [
                    'added' => array_values($batch),
                    'deleted' => [],
                    'modified' => []
                ];

                // Save via REST API to leverage core validation/parsers
                error_log('CSS Utility Importer: Saving batch of ' . count($batch_items) . ' items via REST');
                $save = $this->api_client->save_classes($batch_items, $order_payload, $changes, 'frontend');
                if (empty($save['success'])) {
                    throw new \Exception('Failed to save batch of classes');
                }

                // Update in-memory order after successful batch
                $current_order = $order_payload;
            }
            
            // Update plugin tracking
            $this->update_imported_classes($mapped_classes, $file_name);
            error_log('CSS Utility Importer: Updated plugin tracking');
            
            return [
                'success' => true,
                'message' => sprintf(__('Successfully imported %d classes from %s', 'css-utility-importer'), count($mapped_classes), $file_name),
                'imported_count' => count($mapped_classes)
            ];
            
        } catch (\Exception $e) {
            error_log('CSS Utility Importer: Import failed: ' . $e->getMessage());
            error_log('CSS Utility Importer: Import error trace: ' . $e->getTraceAsString());
            return [
                'success' => false,
                'message' => sprintf(__('Failed to import classes: %s', 'css-utility-importer'), $e->getMessage())
            ];
        }
    }
    
    public function sync_with_elementor() {
        try {
            // Get classes from Elementor via repository
            $classes = $this->repository->context('frontend')->all();
            $elementor_items = $classes->get_items()->all();
            
            // Get classes tracked by plugin
            $tracked_classes = get_option('css_utility_importer_imported_classes', []);
            
            // Find differences
            $sync_result = $this->compare_classes($elementor_items, $tracked_classes);
            
            return [
                'success' => true,
                'message' => __('Sync completed successfully', 'css-utility-importer'),
                'sync_result' => $sync_result
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => sprintf(__('Sync failed: %s', 'css-utility-importer'), $e->getMessage())
            ];
        }
    }
    
    public function delete_class($class_id) {
        try {
            // Get current classes
            $current_classes = $this->repository->context('frontend')->all();
            $current_items = $current_classes->get_items()->all();
            $current_order = $current_classes->get_order()->all();
            
            // Check if class exists
            if (!isset($current_items[$class_id])) {
                return [
                    'success' => false,
                    'message' => __('Class not found', 'css-utility-importer')
                ];
            }
            
            // Build REST payload to delete
            $changes = [
                'added' => [],
                'deleted' => [ $class_id ],
                'modified' => []
            ];

            $updated_order = array_values(array_filter($current_order, function($id) use ($class_id) { return $id !== $class_id; }));

            $this->api_client->save_classes([], $updated_order, $changes, 'frontend');
            
            // Update plugin tracking
            $this->remove_tracked_class($class_id);
            
            return [
                'success' => true,
                'message' => __('Class deleted successfully', 'css-utility-importer')
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => sprintf(__('Failed to delete class: %s', 'css-utility-importer'), $e->getMessage())
            ];
        }
    }
    
    public function delete_all_classes() {
        try {
            // Clear all classes via REST (delete all current ids)
            $current_classes = $this->repository->context('frontend')->all();
            $current_items = $current_classes->get_items()->all();
            $current_order = $current_classes->get_order()->all();

            $changes = [
                'added' => [],
                'deleted' => array_keys($current_items),
                'modified' => []
            ];

            $this->api_client->save_classes([], [], $changes, 'frontend');
            
            // Clear plugin tracking
            delete_option('css_utility_importer_imported_classes');
            
            return [
                'success' => true,
                'message' => __('All classes deleted successfully', 'css-utility-importer')
            ];
            
        } catch (\Exception $e) {
            error_log('CSS Utility Importer: Delete all classes error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => sprintf(__('Failed to delete all classes: %s', 'css-utility-importer'), $e->getMessage())
            ];
        }
    }
    
    public function update_class($class_id, $class_data) {
        try {
            // Get current classes
            $current_classes = $this->repository->context('frontend')->all();
            $current_items = $current_classes->get_items()->all();
            $current_order = $current_classes->get_order()->all();
            
            // Check if class exists
            if (!isset($current_items[$class_id])) {
                return [
                    'success' => false,
                    'message' => __('Class not found', 'css-utility-importer')
                ];
            }
            
            // Save only the modified class via REST
            $changes = [
                'added' => [],
                'deleted' => [],
                'modified' => [ $class_id ]
            ];

            $this->api_client->save_classes([ $class_id => $class_data ], $current_order, $changes, 'frontend');
            
            // Update plugin tracking
            $this->update_tracked_class($class_id, $class_data);
            
            return [
                'success' => true,
                'message' => __('Class updated successfully', 'css-utility-importer')
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => sprintf(__('Failed to update class: %s', 'css-utility-importer'), $e->getMessage())
            ];
        }
    }
    
    public function get_elementor_classes() {
        try {
            $classes = $this->repository->context('frontend')->all();
            return [
                'success' => true,
                'classes' => $classes->get_items()->all(),
                'order' => $classes->get_order()->all()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => sprintf(__('Failed to get classes: %s', 'css-utility-importer'), $e->getMessage())
            ];
        }
    }
    
    public function get_imported_classes() {
        return get_option('css_utility_importer_imported_classes', []);
    }
    
    private function update_imported_classes($mapped_classes, $file_name) {
        $imported_classes = get_option('css_utility_importer_imported_classes', []);
        
        foreach ($mapped_classes as $class_id => $class_data) {
            $imported_classes[$class_id] = [
                'id' => $class_id,
                'label' => $class_data['label'],
                'type' => $class_data['type'],
                'file_name' => $file_name,
                'imported_at' => current_time('mysql'),
                'variants_count' => count($class_data['variants'])
            ];
        }
        
        update_option('css_utility_importer_imported_classes', $imported_classes);
    }
    
    private function remove_tracked_class($class_id) {
        $imported_classes = get_option('css_utility_importer_imported_classes', []);
        
        if (isset($imported_classes[$class_id])) {
            unset($imported_classes[$class_id]);
            update_option('css_utility_importer_imported_classes', $imported_classes);
        }
    }
    
    private function update_tracked_class($class_id, $class_data) {
        $imported_classes = get_option('css_utility_importer_imported_classes', []);
        
        if (isset($imported_classes[$class_id])) {
            $imported_classes[$class_id]['label'] = $class_data['label'];
            $imported_classes[$class_id]['variants_count'] = count($class_data['variants']);
            $imported_classes[$class_id]['updated_at'] = current_time('mysql');
            
            update_option('css_utility_importer_imported_classes', $imported_classes);
        }
    }
    
    private function compare_classes($elementor_items, $tracked_classes) {
        $sync_result = [
            'added' => [],
            'removed' => [],
            'modified' => []
        ];
        
        // Find classes that exist in Elementor but not in tracked
        foreach ($elementor_items as $class_id => $class_data) {
            if (!isset($tracked_classes[$class_id])) {
                $sync_result['added'][] = $class_id;
            }
        }
        
        // Find classes that exist in tracked but not in Elementor
        foreach ($tracked_classes as $class_id => $class_data) {
            if (!isset($elementor_items[$class_id])) {
                $sync_result['removed'][] = $class_id;
            }
        }
        
        // Find modified classes
        foreach ($tracked_classes as $class_id => $tracked_data) {
            if (isset($elementor_items[$class_id])) {
                $elementor_data = $elementor_items[$class_id];
                
                // Compare key properties
                if ($tracked_data['label'] !== $elementor_data['label'] ||
                    $tracked_data['variants_count'] !== count($elementor_data['variants'])) {
                    $sync_result['modified'][] = $class_id;
                }
            }
        }
        
        return $sync_result;
    }
    
    public function export_classes($class_ids = []) {
        try {
            $classes = $this->repository->context('frontend')->all();
            $all_items = $classes->get_items()->all();
            
            if (empty($class_ids)) {
                $export_data = $all_items;
            } else {
                $export_data = array_intersect_key($all_items, array_flip($class_ids));
            }
            
            return [
                'success' => true,
                'classes' => $export_data,
                'count' => count($export_data)
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => sprintf(__('Export failed: %s', 'css-utility-importer'), $e->getMessage())
            ];
        }
    }
    
    public function import_from_export($export_data) {
        try {
            if (empty($export_data['classes'])) {
                return [
                    'success' => false,
                    'message' => __('No classes to import', 'css-utility-importer')
                ];
            }
            
            // Get current classes
            $current_classes = $this->repository->context('frontend')->all();
            $current_items = $current_classes->get_items()->all();
            $current_order = $current_classes->get_order()->all();
            
            // Batch import using REST semantics (only added items per batch)
            $to_add_ids = array_keys($export_data['classes']);
            $batches = array_chunk($to_add_ids, 50);

            foreach ($batches as $batch) {
                $batch_items = [];
                foreach ($batch as $id) {
                    $batch_items[$id] = $export_data['classes'][$id];
                }
                $order_payload = $current_order;
                foreach ($batch as $id) {
                    if (!in_array($id, $order_payload, true)) {
                        $order_payload[] = $id;
                    }
                }
                $changes = [ 'added' => array_values($batch), 'deleted' => [], 'modified' => [] ];
                $save = $this->api_client->save_classes($batch_items, $order_payload, $changes, 'frontend');
                if (empty($save['success'])) {
                    throw new \Exception('Failed to import exported classes batch');
                }
                $current_order = $order_payload;
            }
            
            return [
                'success' => true,
                'message' => sprintf(__('Successfully imported %d classes', 'css-utility-importer'), count($export_data['classes'])),
                'imported_count' => count($export_data['classes'])
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => sprintf(__('Import failed: %s', 'css-utility-importer'), $e->getMessage())
            ];
        }
    }
}
