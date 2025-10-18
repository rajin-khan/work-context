<?php
/**
 * Admin page template for CSS Utility Importer
 */

if (!defined('ABSPATH')) {
    exit;
}

// Get the plugin instance
$main_plugin = CSSUtilityImporter\MainPlugin::get_instance();
$elementor_integration = $main_plugin->elementor_integration;

if ($elementor_integration) {
    $imported_classes = $elementor_integration->get_imported_classes();
    $elementor_classes = $elementor_integration->get_elementor_classes();
} else {
    $imported_classes = [];
    $elementor_classes = ['success' => false, 'classes' => [], 'order' => []];
}
?>

<div class="wrap css-utility-importer-admin">
    <div class="skelementor-header" style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <img src="<?php echo esc_url( CSS_UTILITY_IMPORTER_URL . 'skelementor.svg' ); ?>" alt="Skelementor" style="width:40px;height:40px;" />
        <div>
            <h1 style="margin:0;line-height:1;"><?php _e('Skelementor', 'css-utility-importer'); ?></h1>
            <p style="margin:2px 0 0;color:#666;"><?php _e('CSS utilities & variables importer for Elementor v4', 'css-utility-importer'); ?></p>
        </div>
        <div style="margin-left:auto;display:flex;gap:10px;">
            <a class="button" href="https://skelementor.com" target="_blank" rel="noopener"><?php _e('Website', 'css-utility-importer'); ?></a>
            <a class="button" href="https://rajinkhan.com" target="_blank" rel="noopener"><?php _e('By Rajin Khan', 'css-utility-importer'); ?></a>
        </div>
    </div>
    
    <div class="css-utility-importer-container">
        <!-- Import Section -->
        <div class="css-utility-importer-section">
            <h2><?php _e('Import CSS Utilities & Variables', 'css-utility-importer'); ?></h2>
            
            <div class="css-utility-importer-import-form">
                <form id="css-utility-import-form">
                    <div class="form-group">
                        <label for="css-file-name"><?php _e('File Name (Optional)', 'css-utility-importer'); ?></label>
                        <input type="text" id="css-file-name" name="file_name" placeholder="<?php _e('e.g., tailwind-utilities.css', 'css-utility-importer'); ?>" />
                    </div>
                    
                    <div class="form-group">
                        <label for="css-content"><?php _e('CSS Content', 'css-utility-importer'); ?></label>
                        <textarea id="css-content" name="css_content" rows="12" placeholder="<?php _e('Paste CSS including :root variables and utility classes...', 'css-utility-importer'); ?>"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" id="parse-css-btn" class="button button-secondary">
                            <?php _e('Preview Parse', 'css-utility-importer'); ?>
                        </button>
                        <button type="submit" id="import-css-btn" class="button button-primary">
                            <?php _e('Import Into Elementor', 'css-utility-importer'); ?>
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Parse Results -->
            <div id="parse-results" class="css-utility-importer-results" style="display: none;">
                <h3><?php _e('Parsed Classes', 'css-utility-importer'); ?></h3>
                <div id="parse-results-content"></div>
            </div>

            <!-- Parsed Variables Results -->
            <div id="parse-variables" class="css-utility-importer-results" style="display: none; margin-top:16px;">
                <h3><?php _e('Parsed Variables', 'css-utility-importer'); ?></h3>
                <div id="parse-variables-content"></div>
            </div>
        </div>
        
        <!-- Classes Management Section -->
        <div class="css-utility-importer-section">
            <h2><?php _e('Imported Utility Classes', 'css-utility-importer'); ?></h2>
            
            <div class="css-utility-importer-actions">
                <button id="refresh-classes-btn" class="button button-secondary">
                    <?php _e('Refresh', 'css-utility-importer'); ?>
                </button>
                <button id="export-selected-btn" class="button button-secondary" disabled>
                    <?php _e('Export Selected', 'css-utility-importer'); ?>
                </button>
                <button id="delete-all-classes-btn" class="button button-secondary" style="background-color: #dc3232; color: white; border-color: #dc3232;">
                    <?php _e('Delete All Classes', 'css-utility-importer'); ?>
                </button>
                <button id="sync-with-elementor-btn" class="button button-secondary">
                    <?php _e('Sync with Elementor', 'css-utility-importer'); ?>
                </button>
            </div>
            
            <div class="css-utility-importer-classes-list">
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th class="check-column">
                                <input type="checkbox" id="select-all-classes" />
                            </th>
                            <th><?php _e('Class Name', 'css-utility-importer'); ?></th>
                            <th><?php _e('Label', 'css-utility-importer'); ?></th>
                            <th><?php _e('Type', 'css-utility-importer'); ?></th>
                            <th><?php _e('Variants', 'css-utility-importer'); ?></th>
                            <th><?php _e('Source File', 'css-utility-importer'); ?></th>
                            <th><?php _e('Imported', 'css-utility-importer'); ?></th>
                            <th><?php _e('Actions', 'css-utility-importer'); ?></th>
                        </tr>
                    </thead>
                    <tbody id="classes-list-tbody">
                        <?php if (!empty($imported_classes)): ?>
                            <?php foreach ($imported_classes as $class_id => $class_data): ?>
                                <tr data-class-id="<?php echo esc_attr($class_id); ?>">
                                    <th class="check-column">
                                        <input type="checkbox" class="class-checkbox" value="<?php echo esc_attr($class_id); ?>" />
                                    </th>
                                    <td>
                                        <code><?php echo esc_html($class_id); ?></code>
                                    </td>
                                    <td>
                                        <strong><?php echo esc_html($class_data['label']); ?></strong>
                                    </td>
                                    <td>
                                        <span class="class-type-badge class-type-<?php echo esc_attr($class_data['type']); ?>">
                                            <?php echo esc_html(ucfirst($class_data['type'])); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <span class="variants-count"><?php echo intval($class_data['variants_count']); ?></span>
                                    </td>
                                    <td>
                                        <?php echo esc_html($class_data['file_name'] ?? 'Unknown'); ?>
                                    </td>
                                    <td>
                                        <?php echo esc_html($class_data['imported_at'] ?? 'Unknown'); ?>
                                    </td>
                                    <td>
                                        <button class="button button-small view-class-btn" data-class-id="<?php echo esc_attr($class_id); ?>">
                                            <?php _e('View', 'css-utility-importer'); ?>
                                        </button>
                                        <button class="button button-small delete-class-btn" data-class-id="<?php echo esc_attr($class_id); ?>">
                                            <?php _e('Delete', 'css-utility-importer'); ?>
                                        </button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="8" class="no-classes">
                                    <?php _e('No classes imported yet.', 'css-utility-importer'); ?>
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Variables Management Section -->
        <div class="css-utility-importer-section">
            <h2><?php _e('Imported Global Variables', 'css-utility-importer'); ?></h2>

            <div class="css-utility-importer-actions">
                <button id="variables-refresh-btn" class="button button-secondary">
                    <?php _e('Refresh', 'css-utility-importer'); ?>
                </button>
                <button id="variables-delete-all-btn" class="button button-secondary">
                    <?php _e('Delete All Variables', 'css-utility-importer'); ?>
                </button>
            </div>

            <div class="css-utility-importer-variables-list">
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th><?php _e('ID', 'css-utility-importer'); ?></th>
                            <th><?php _e('Label', 'css-utility-importer'); ?></th>
                            <th><?php _e('Type', 'css-utility-importer'); ?></th>
                            <th><?php _e('Value', 'css-utility-importer'); ?></th>
                            <th><?php _e('Actions', 'css-utility-importer'); ?></th>
                        </tr>
                    </thead>
                    <tbody id="variables-list-tbody">
                        <tr><td colspan="5" class="no-variables"><?php _e('No variables found yet.', 'css-utility-importer'); ?></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Class Details Modal -->
        <div id="class-details-modal" class="css-utility-importer-modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-class-name"><?php _e('Class Details', 'css-utility-importer'); ?></h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="modal-class-content"></div>
                </div>
                <div class="modal-footer">
                    <button class="button button-secondary modal-close"><?php _e('Close', 'css-utility-importer'); ?></button>
                </div>
            </div>
        </div>
        
        <!-- Import Progress Modal -->
        <div id="import-progress-modal" class="css-utility-importer-modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><?php _e('Importing Classes', 'css-utility-importer'); ?></h3>
                </div>
                <div class="modal-body">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <p id="import-status"><?php _e('Starting import...', 'css-utility-importer'); ?></p>
                </div>
            </div>
        </div>
    </div>
</div>

        

<script type="text/template" id="class-details-template">
    <div class="class-details">
        <div class="class-info">
            <h4><?php _e('Class Information', 'css-utility-importer'); ?></h4>
            <table class="class-info-table">
                <tr>
                    <th><?php _e('ID:', 'css-utility-importer'); ?></th>
                    <td><code>{{id}}</code></td>
                </tr>
                <tr>
                    <th><?php _e('Label:', 'css-utility-importer'); ?></th>
                    <td>{{label}}</td>
                </tr>
                <tr>
                    <th><?php _e('Type:', 'css-utility-importer'); ?></th>
                    <td>{{type}}</td>
                </tr>
                <tr>
                    <th><?php _e('Variants:', 'css-utility-importer'); ?></th>
                    <td>{{variants_count}}</td>
                </tr>
            </table>
        </div>
        
        <div class="class-variants">
            <h4><?php _e('Variants', 'css-utility-importer'); ?></h4>
            <div class="variants-list">
                {{#variants}}
                <div class="variant-item">
                    <h5>{{state}} {{#breakpoint}}({{breakpoint}}){{/breakpoint}}</h5>
                    <div class="variant-properties">
                        {{#props}}
                        <div class="property-item">
                            <strong>{{key}}:</strong> <code>{{value}}</code>
                        </div>
                        {{/props}}
                    </div>
                </div>
                {{/variants}}
            </div>
        </div>
    </div>
</script>

<script type="text/template" id="parse-variables-template">
    <div class="parse-results-summary">
        <p><?php _e('Found', 'css-utility-importer'); ?> <strong>{{variables_count}}</strong> <?php _e('variables', 'css-utility-importer'); ?></p>
    </div>
    <div class="parse-results-list">
        {{#variables}}
        <div class="parsed-variable-item">
            <code>{{name}}</code>
            <span class="variable-value"> = {{value}}</span>
        </div>
        {{/variables}}
    </div>
</script>

<script type="text/template" id="parse-results-template">
    <div class="parse-results-summary">
        <p><?php _e('Found', 'css-utility-importer'); ?> <strong>{{count}}</strong> <?php _e('utility classes', 'css-utility-importer'); ?></p>
    </div>
    
    <div class="parse-results-list">
        {{#classes}}
        <div class="parsed-class-item">
            <div class="class-header">
                <code>{{name}}</code>
                <span class="class-type-badge class-type-{{type}}">{{type}}</span>
            </div>
            <div class="class-properties">
                {{#properties}}
                <span class="property-tag">{{key}}: {{value}}</span>
                {{/properties}}
            </div>
        </div>
        {{/classes}}
    </div>
</script>
