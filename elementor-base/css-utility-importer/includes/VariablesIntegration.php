<?php

namespace CSSUtilityImporter;

use Elementor\Plugin;
use Elementor\Modules\Variables\Storage\Repository as VariablesRepository;

if (!defined('ABSPATH')) {
    exit;
}

class VariablesIntegration {

    private VariablesRepository $repo;

    public function __construct() {
        if (!class_exists('Elementor\\Plugin') || !class_exists('Elementor\\Modules\\Variables\\Storage\\Repository')) {
            throw new \Exception('Elementor Variables module not available.');
        }

        $kit = Plugin::$instance->kits_manager->get_active_kit();
        $this->repo = new VariablesRepository($kit);
    }

    public function list_variables() {
        try {
            $vars = $this->repo->variables();
            // Filter out deleted records to match Variables Manager view
            $active = [];
            foreach ($vars as $id => $v) {
                if (isset($v['deleted']) && $v['deleted']) { continue; }
                $active[$id] = $v;
            }
            return [ 'success' => true, 'variables' => $active ];
        } catch (\Throwable $e) {
            return [ 'success' => false, 'message' => $e->getMessage() ];
        }
    }

    public function create_variable($type, $label, $value) {
        try {
            $result = $this->repo->create([
                'type' => $type,
                'label' => $label,
                'value' => $value,
            ]);
            // Ensure Elementor regenerates assets and the Variables Manager reflects changes
            try { Plugin::$instance->files_manager->clear_cache(); } catch (\Throwable $__) {}
            return [ 'success' => true, 'variable' => $result['variable'] ?? null ];
        } catch (\Throwable $e) {
            return [ 'success' => false, 'message' => $e->getMessage() ];
        }
    }

    public function update_variable($id, $payload) {
        try {
            $res = $this->repo->update($id, $payload);
            // Clear Elementor cache so UI updates immediately
            try { Plugin::$instance->files_manager->clear_cache(); } catch (\Throwable $__) {}
            return [ 'success' => true, 'variable' => $res['variable'] ?? null ];
        } catch (\Throwable $e) {
            return [ 'success' => false, 'message' => $e->getMessage() ];
        }
    }

    public function delete_variable($id) {
        try {
            $this->repo->delete($id);
            // Clear Elementor cache so deletion reflects in Variables Manager
            try { Plugin::$instance->files_manager->clear_cache(); } catch (\Throwable $__) {}
            return [ 'success' => true ];
        } catch (\Throwable $e) {
            return [ 'success' => false, 'message' => $e->getMessage() ];
        }
    }

    public function delete_all_variables() {
        try {
            $current = $this->repo->variables();
            foreach ($current as $id => $v) {
                if (isset($v['deleted']) && $v['deleted']) { continue; }
                try { $this->repo->delete($id); } catch (\Throwable $__) {}
            }
            try { Plugin::$instance->files_manager->clear_cache(); } catch (\Throwable $__) {}
            return [ 'success' => true ];
        } catch (\Throwable $e) {
            return [ 'success' => false, 'message' => $e->getMessage() ];
        }
    }

    public function upsert_variable_by_label($type, $label, $value) {
        // Find by label (case-insensitive); if exists, update value; else create
        try {
            $current = $this->repo->variables();
            $existingId = null;
            foreach ($current as $id => $v) {
                if (isset($v['deleted']) && $v['deleted']) continue;
                if (isset($v['label']) && strtolower($v['label']) === strtolower($label)) {
                    $existingId = $id; break;
                }
            }
            if ($existingId) {
                return $this->update_variable($existingId, [ 'label' => $label, 'value' => $value ]);
            }
            return $this->create_variable($type, $label, $value);
        } catch (\Throwable $e) {
            return [ 'success' => false, 'message' => $e->getMessage() ];
        }
    }
}


