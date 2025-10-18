(function($) {
    'use strict';
    
    const CSSUtilityImporter = {
        init: function() {
            this.bindEvents();
            // Auto-load variables on page open
            this.variablesRefresh();
        },
        
        bindEvents: function() {
            // Import form
            $('#css-utility-import-form').on('submit', this.handleImport);
            $('#parse-css-btn').on('click', this.handleParse);
            $('#import-css-btn').on('click', this.handleImport);
            
            // Classes management
            $('#refresh-classes-btn').on('click', this.loadClasses);
            $('#export-selected-btn').on('click', this.handleExport);
            $('#delete-all-classes-btn').on('click', this.handleDeleteAll);
            $('#sync-with-elementor-btn').on('click', this.handleSync);
            
            // Class actions
            $(document).on('click', '.view-class-btn', this.viewClass);
            $(document).on('click', '.delete-class-btn', this.deleteClass);
            
            // Select all checkbox
            $('#select-all-classes').on('change', this.toggleSelectAll);
            $(document).on('change', '.class-checkbox', this.updateExportButton);
            
            // Modal events
            $('.modal-close').on('click', this.closeModal);
            $(document).on('click', '.css-utility-importer-modal', function(e) {
                if (e.target === this) {
                    CSSUtilityImporter.closeModal();
                }
            });

            // Variables (auto import only; delete single/all)
            $('#variables-refresh-btn').on('click', this.variablesRefresh);
            $('#variables-delete-all-btn').on('click', this.variablesDeleteAll);
            $(document).on('click', '.variable-delete-btn', this.variableDelete);
        },
        
        handleParse: function(e) {
            e.preventDefault();
            
            const cssContent = $('#css-content').val().trim();
            if (!cssContent) {
                alert('Please enter CSS content to parse.');
                return;
            }
            
            CSSUtilityImporter.showProgress('parsing');
            
            $.ajax({
                url: cssUtilityImporter.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'css_utility_parse',
                    nonce: cssUtilityImporter.nonce,
                    css_content: cssContent
                },
                success: function(response) {
                    CSSUtilityImporter.hideProgress();
                    
                    if (response.success) {
                        CSSUtilityImporter.showParseResults(response.data);
                    } else {
                        alert('Error: ' + response.data);
                    }
                },
                error: function(xhr, status, error) {
                    CSSUtilityImporter.hideProgress();
                    console.error('Parse AJAX Error:', {
                        status: status,
                        error: error,
                        response: xhr.responseText,
                        statusCode: xhr.status
                    });
                    alert('An error occurred while parsing CSS. Check console for details.');
                }
            });
        },
        
        handleImport: function(e) {
            e.preventDefault();
            
            const cssContent = $('#css-content').val().trim();
            const fileName = $('#css-file-name').val().trim();
            
            if (!cssContent) {
                alert('Please enter CSS content to import.');
                return;
            }
            
            console.log('Starting import with:', {
                cssContent: cssContent.substring(0, 100) + '...',
                fileName: fileName,
                ajaxUrl: cssUtilityImporter.ajaxUrl,
                nonce: cssUtilityImporter.nonce
            });
            
            CSSUtilityImporter.showImportProgress();
            
            $.ajax({
                url: cssUtilityImporter.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'css_utility_import',
                    nonce: cssUtilityImporter.nonce,
                    css_content: cssContent,
                    file_name: fileName
                },
                success: function(response) {
                    CSSUtilityImporter.hideImportProgress();
                    console.log('Import response:', response);
                    
                    if (response.success) {
                        alert(response.data.message);
                        CSSUtilityImporter.loadClasses();
                        CSSUtilityImporter.variablesRefresh();
                        $('#css-utility-import-form')[0].reset();
                        $('#parse-results').hide();
                    } else {
                        console.error('Import error:', response.data);
                        alert('Error: ' + response.data);
                    }
                },
                error: function(xhr, status, error) {
                    CSSUtilityImporter.hideImportProgress();
                    console.error('Import AJAX Error:', {
                        status: status,
                        error: error,
                        response: xhr.responseText,
                        statusCode: xhr.status
                    });
                    alert('An error occurred while importing classes. Check console for details.');
                }
            });
        },
        
        handleExport: function() {
            const selectedClasses = $('.class-checkbox:checked').map(function() {
                return $(this).val();
            }).get();
            
            if (selectedClasses.length === 0) {
                alert(cssUtilityImporter.strings.no_classes_selected);
                return;
            }
            
            if (!confirm(cssUtilityImporter.strings.confirm_export)) {
                return;
            }
            
            $.ajax({
                url: cssUtilityImporter.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'css_utility_export_classes',
                    nonce: cssUtilityImporter.nonce,
                    class_ids: selectedClasses
                },
                success: function(response) {
                    if (response.success) {
                        // Create download link
                        const link = document.createElement('a');
                        link.href = response.data.download_url;
                        link.download = response.data.filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        alert(cssUtilityImporter.strings.export_success);
                    } else {
                        alert('Error: ' + response.data);
                    }
                },
                error: function() {
                    alert(cssUtilityImporter.strings.export_error);
                }
            });
        },
        
        handleSync: function() {
            $.ajax({
                url: cssUtilityImporter.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'css_utility_sync',
                    nonce: cssUtilityImporter.nonce
                },
                success: function(response) {
                    if (response.success) {
                        alert('Sync completed successfully.');
                        CSSUtilityImporter.loadClasses();
                    } else {
                        alert('Sync failed: ' + response.data);
                    }
                },
                error: function() {
                    alert('An error occurred during sync.');
                }
            });
        },
        
        loadClasses: function() {
            console.log('Loading classes...');
            $.ajax({
                url: cssUtilityImporter.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'css_utility_get_classes',
                    nonce: cssUtilityImporter.nonce
                },
                success: function(response) {
                    console.log('Classes loaded:', response);
                    if (response.success) {
                        console.log('Classes data:', response.data.classes);
                        CSSUtilityImporter.updateClassesList(response.data.classes);
                    } else {
                        console.error('Error loading classes:', response.data);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('AJAX Error loading classes:', error);
                    console.error('Response:', xhr.responseText);
                }
            });
        },
        
        viewClass: function() {
            const classId = $(this).data('class-id');
            
            // Get class details from Elementor
            $.ajax({
                url: cssUtilityImporter.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'css_utility_get_classes',
                    nonce: cssUtilityImporter.nonce
                },
                success: function(response) {
                    if (response.success && response.data.classes[classId]) {
                        const classData = response.data.classes[classId];
                        CSSUtilityImporter.showClassDetails(classData);
                    }
                }
            });
        },
        
        deleteClass: function() {
            const classId = $(this).data('class-id');
            
            if (!confirm(cssUtilityImporter.strings.confirm_delete)) {
                return;
            }
            
            $.ajax({
                url: cssUtilityImporter.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'css_utility_delete_class',
                    nonce: cssUtilityImporter.nonce,
                    class_id: classId
                },
                success: function(response) {
                    if (response.success) {
                        alert('Class deleted successfully.');
                        CSSUtilityImporter.loadClasses();
                    } else {
                        alert('Error: ' + response.data);
                    }
                },
                error: function() {
                    alert('An error occurred while deleting the class.');
                }
            });
        },
        
        handleDeleteAll: function() {
            if (!confirm('Are you sure you want to delete ALL imported classes? This action cannot be undone.')) {
                return;
            }
            
            $.ajax({
                url: cssUtilityImporter.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'css_utility_delete_all_classes',
                    nonce: cssUtilityImporter.nonce
                },
                success: function(response) {
                    if (response.success) {
                        alert('All classes deleted successfully.');
                        CSSUtilityImporter.loadClasses();
                    } else {
                        alert('Error: ' + response.data);
                    }
                },
                error: function() {
                    alert('An error occurred while deleting all classes.');
                }
            });
        },
        
        showParseResults: function(data) {
            console.log('Parse results data:', data);
            console.log('Classes array:', data.classes);
            console.log('First class:', data.classes ? data.classes[0] : 'No classes');
            
            const template = $('#parse-results-template').html();
            console.log('Template:', template);
            const html = CSSUtilityImporter.renderTemplate(template, data);
            console.log('Rendered HTML:', html);
            
            $('#parse-results-content').html(html);
            $('#parse-results').show();

            // Variables preview
            if (data.variables && data.variables.length) {
                const vTemplate = $('#parse-variables-template').html();
                const vHtml = CSSUtilityImporter.renderTemplate(vTemplate, data);
                $('#parse-variables-content').html(vHtml);
                $('#parse-variables').show();
            } else {
                $('#parse-variables-content').empty();
                $('#parse-variables').hide();
            }
        },
        
        showClassDetails: function(classData) {
            const template = $('#class-details-template').html();
            const html = CSSUtilityImporter.renderTemplate(template, classData);
            
            $('#modal-class-content').html(html);
            $('#modal-class-name').text(classData.label);
            $('#class-details-modal').show();
        },
        
        updateClassesList: function(classes) {
            // Update the classes list in the table without reloading
            const tbody = $('#classes-list-tbody');
            tbody.empty();
            
            if (classes && Object.keys(classes).length > 0) {
                Object.keys(classes).forEach(function(classId) {
                    const classData = classes[classId];
                    const row = CSSUtilityImporter.createClassRow(classId, classData);
                    tbody.append(row);
                });
            } else {
                tbody.append('<tr><td colspan="8" class="no-classes">No classes imported yet.</td></tr>');
            }
        },
        
        createClassRow: function(classId, classData) {
            const row = $('<tr data-class-id="' + classId + '">');
            row.append('<th class="check-column"><input type="checkbox" class="class-checkbox" value="' + classId + '" /></th>');
            row.append('<td><code>' + classId + '</code></td>');
            row.append('<td><strong>' + (classData.label || classId) + '</strong></td>');
            row.append('<td><span class="class-type-badge class-type-' + (classData.type || 'class') + '">' + (classData.type || 'Class') + '</span></td>');
            row.append('<td><span class="variants-count">' + (classData.variants ? classData.variants.length : 0) + '</span></td>');
            row.append('<td>Imported</td>');
            row.append('<td>' + new Date().toLocaleDateString() + '</td>');
            row.append('<td><button class="button button-small view-class-btn" data-class-id="' + classId + '">View</button> <button class="button button-small delete-class-btn" data-class-id="' + classId + '">Delete</button></td>');
            return row;
        },
        
        showProgress: function(type) {
            const status = type === 'parsing' ? cssUtilityImporter.strings.parsing : cssUtilityImporter.strings.importing;
            $('#import-status').text(status);
            $('#import-progress-modal').show();
        },
        
        hideProgress: function() {
            $('#import-progress-modal').hide();
        },
        
        showImportProgress: function() {
            $('#import-status').text(cssUtilityImporter.strings.importing);
            $('#import-progress-modal').show();
        },
        
        hideImportProgress: function() {
            $('#import-progress-modal').hide();
        },
        
        closeModal: function() {
            $('.css-utility-importer-modal').hide();
        },
        
        toggleSelectAll: function() {
            const isChecked = $(this).is(':checked');
            $('.class-checkbox').prop('checked', isChecked);
            CSSUtilityImporter.updateExportButton();
        },
        
        updateExportButton: function() {
            const selectedCount = $('.class-checkbox:checked').length;
            $('#export-selected-btn').prop('disabled', selectedCount === 0);
        },

        // Variables
        variablesRefresh: function() {
            $.ajax({
                url: cssUtilityImporter.ajaxUrl,
                type: 'POST',
                data: { action: 'css_variables_list', nonce: cssUtilityImporter.nonce },
                success: function(response) {
                    if (response.success) {
                        CSSUtilityImporter.renderVariablesList(response.data.variables || {});
                    } else {
                        alert('Error loading variables: ' + response.data);
                    }
                },
                error: function() { alert('Error loading variables.'); }
            });
        },

        renderVariablesList: function(varsObj) {
            const tbody = $('#variables-list-tbody');
            tbody.empty();
            const ids = Object.keys(varsObj);
            if (ids.length === 0) {
                tbody.append('<tr><td colspan="5" class="no-variables">No variables found yet.</td></tr>');
                return;
            }
            ids.forEach(function(id) {
                const v = varsObj[id] || {};
                const row = $('<tr>');
                row.append('<td><code>' + id + '</code></td>');
                row.append('<td>' + (v.label || '') + '</td>');
                row.append('<td>' + (v.type || '') + '</td>');
                row.append('<td>' + (typeof v.value === 'object' ? JSON.stringify(v.value) : (v.value || '')) + '</td>');
                row.append('<td><button class="button button-small variable-delete-btn" data-id="' + id + '">Delete</button></td>');
                tbody.append(row);
            });
        },

        variableDelete: function() {
            const id = $(this).data('id');
            if (!confirm('Delete variable ' + id + '?')) return;
            $.ajax({
                url: cssUtilityImporter.ajaxUrl,
                type: 'POST',
                data: { action: 'css_variables_delete', nonce: cssUtilityImporter.nonce, id },
                success: function(response) {
                    if (response.success) { CSSUtilityImporter.variablesRefresh(); } else { alert('Delete failed: ' + response.data); }
                },
                error: function() { alert('Delete failed.'); }
            });
        },

        variablesDeleteAll: function() {
            if (!confirm('Are you sure you want to delete ALL variables? This action cannot be undone.')) return;
            $.ajax({
                url: cssUtilityImporter.ajaxUrl,
                type: 'POST',
                data: { action: 'css_variables_delete_all', nonce: cssUtilityImporter.nonce },
                success: function(response) {
                    if (response.success) { CSSUtilityImporter.variablesRefresh(); } else { alert('Delete all failed: ' + response.data); }
                },
                error: function() { alert('Delete all failed.'); }
            });
        },

        
        renderTemplate: function(template, data) {
            // Simple template renderer to replace Mustache
            let html = template;
            
            console.log('renderTemplate called with data:', data);
            console.log('renderTemplate template:', template);
            
            // Handle sections {{#section}}...{{/section}} FIRST
            html = html.replace(/\{\{#([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, function(match, key, content) {
                console.log('Processing section:', key);
                const keys = key.trim().split('.');
                let value = data;
                
                for (let i = 0; i < keys.length; i++) {
                    if (value && typeof value === 'object' && keys[i] in value) {
                        value = value[keys[i]];
                        console.log('Found section value for', keys[i], ':', value);
                    } else {
                        console.log('No section value found for', keys[i], 'in', value);
                        return '';
                    }
                }
                
                if (Array.isArray(value)) {
                    console.log('Processing array section with', value.length, 'items');
                    return value.map(function(item) {
                        return CSSUtilityImporter.renderTemplate(content, item);
                    }).join('');
                } else if (value && typeof value === 'object') {
                    console.log('Processing object section');
                    return CSSUtilityImporter.renderTemplate(content, value);
                }
                
                return '';
            });
            
            // Handle simple variables {{variable}} AFTER sections
            html = html.replace(/\{\{([^}]+)\}\}/g, function(match, key) {
                const keys = key.trim().split('.');
                let value = data;
                
                console.log('Processing simple variable:', key, 'keys array:', keys);
                
                for (let i = 0; i < keys.length; i++) {
                    if (value && typeof value === 'object' && keys[i] in value) {
                        value = value[keys[i]];
                        console.log('Found value for', keys[i], ':', value);
                    } else {
                        console.log('No value found for', keys[i], 'in', value);
                        return '';
                    }
                }
                
                return value !== null && value !== undefined ? value : '';
            });
            
            return html;
        }
    };
    
    // Initialize when document is ready
    $(document).ready(function() {
        console.log('CSS Utility Importer: Initializing...');
        try {
            CSSUtilityImporter.init();
            console.log('CSS Utility Importer: Initialized successfully');
        } catch (error) {
            console.error('CSS Utility Importer: Initialization error:', error);
        }
    });
    
})(jQuery);
