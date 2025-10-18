<?php

namespace CSSUtilityImporter;

class ClassMapper {
    
    private static $cachedVariablesByLabel = null;
    
    private $elementor_property_mapping = [
        // Size & image-related
        'width' => 'width',
        'height' => 'height',
        'min-width' => 'min-width',
        'min-height' => 'min-height',
        'max-width' => 'max-width',
        'max-height' => 'max-height',
        'overflow' => 'overflow',
        'aspect-ratio' => 'aspect-ratio',
        'object-fit' => 'object-fit',
        'object-position' => 'object-position',
        'top' => 'top',
        'right' => 'right',
        'bottom' => 'bottom',
        'left' => 'left',
        'z-index' => 'z-index',
        // Spacing
        'margin' => 'margin',
        'margin-top' => 'margin-top',
        'margin-right' => 'margin-right',
        'margin-bottom' => 'margin-bottom',
        'margin-left' => 'margin-left',
        'padding' => 'padding',
        'padding-top' => 'padding-top',
        'padding-right' => 'padding-right',
        'padding-bottom' => 'padding-bottom',
        'padding-left' => 'padding-left',
        'gap' => 'gap',
        
        // Typography
        'font-size' => 'font-size',
        'font-weight' => 'font-weight',
        'text-align' => 'text-align',
        'line-height' => 'line-height',
        'color' => 'color',
        
        // Background
        'background-color' => 'background-color',
        'background-image' => 'background-image',
        'background-position' => 'background-position',
        'background-repeat' => 'background-repeat',
        'background-size' => 'background-size',
        
        // Border
        'border-width' => 'border-width',
        'border-style' => 'border-style',
        'border-color' => 'border-color',
        'border-radius' => 'border-radius',
        
        // Layout
        'display' => 'display',
        'position' => 'position',
        'float' => 'float',
        'clear' => 'clear',
        
        // Flexbox
        'flex-direction' => 'flex-direction',
        'flex-wrap' => 'flex-wrap',
        'justify-content' => 'justify-content',
        'align-items' => 'align-items',
        'align-self' => 'align-self',
        
        // Grid
        'grid-template-columns' => 'grid-template-columns',
        'grid-template-rows' => 'grid-template-rows',
        'grid-column' => 'grid-column',
        'grid-row' => 'grid-row',
        
        // Effects
        'box-shadow' => 'box-shadow',
        'opacity' => 'opacity',
        'transform' => 'transform',
        'transition' => 'transition'
    ];
    
    private $value_converters = [
        'margin' => 'convert_spacing_value',
        'padding' => 'convert_spacing_value',
        'font-size' => 'convert_font_size_value',
        'font-weight' => 'convert_font_weight_value',
        'color' => 'convert_color_value',
        'background-color' => 'convert_color_value',
        'border-color' => 'convert_color_value',
        'border-radius' => 'convert_border_radius_value',
        'box-shadow' => 'convert_box_shadow_value',
        'opacity' => 'convert_opacity_value'
    ];
    
    public function map_to_elementor_format($parsed_classes) {
        $elementor_classes = [];
        
        foreach ($parsed_classes as $class_name => $class_data) {
            $elementor_class = $this->map_single_class($class_name, $class_data);
            if ($elementor_class) {
                // Key by Elementor class id to align with repository expectations
                $elementor_classes[$elementor_class['id']] = $elementor_class;
            }
        }
        
        return $elementor_classes;
    }
    
    private function map_single_class($class_name, $class_data) {
        try {
            $class_label = $this->validate_class_label($class_name);
            $class_id = $this->generate_elementor_class_id(); // Use Elementor's ID generation algorithm
            
            $elementor_class = [
                'id' => $class_id,
                'label' => $class_label,
                'type' => 'class',
                'variants' => []
            ];
        } catch (\Exception $e) {
            error_log('CSS Utility Importer - Error creating class ' . $class_name . ': ' . $e->getMessage());
            return null;
        }
        
        // Create default variant
        $default_variant = $this->create_variant($class_data['properties'], 'default');
        if ($default_variant) {
            $elementor_class['variants'][] = $default_variant;
        }
        
        // Create hover variant if hover properties exist
        if (isset($class_data['pseudo_classes']['hover'])) {
            $hover_variant = $this->create_variant($class_data['pseudo_classes']['hover'], 'hover');
            if ($hover_variant) {
                $elementor_class['variants'][] = $hover_variant;
            }
        }
        
        // Create focus variant if focus properties exist
        if (isset($class_data['pseudo_classes']['focus'])) {
            $focus_variant = $this->create_variant($class_data['pseudo_classes']['focus'], 'focus');
            if ($focus_variant) {
                $elementor_class['variants'][] = $focus_variant;
            }
        }
        
        // Create active variant if active properties exist
        if (isset($class_data['pseudo_classes']['active'])) {
            $active_variant = $this->create_variant($class_data['pseudo_classes']['active'], 'active');
            if ($active_variant) {
                $elementor_class['variants'][] = $active_variant;
            }
        }
        
        // Handle media queries
        if (!empty($class_data['media_queries'])) {
            foreach ($class_data['media_queries'] as $media_query) {
                $breakpoint = $this->map_media_query_to_breakpoint($media_query['media_query']);
                if ($breakpoint) {
                    $responsive_variant = $this->create_variant($media_query['properties'], 'default', $breakpoint);
                    if ($responsive_variant) {
                        $elementor_class['variants'][] = $responsive_variant;
                    }
                }
            }
        }
        
        return $elementor_class;
    }
    
    private function create_variant($properties, $state = 'default', $breakpoint = null) {
        // Match Elementor's exact variant structure
        $variant = [
            'meta' => [
                'breakpoint' => $breakpoint ?: 'desktop',
                'state' => $state !== 'default' ? $state : null,
            ],
            'props' => []
        ];
        
        // Only add custom_css if it has content (omit when null)
        // This prevents validation errors in Elementor's Style_Parser
        
        // Only allow props that exist in Elementor's Style_Schema
        $allowed_props = [
            // size
            'width','height','min-width','min-height','max-width','max-height','overflow','aspect-ratio','object-fit','object-position',
            // position
            'position','top','right','bottom','left','z-index',
            // typography (subset commonly used)
            'font-size','font-weight','line-height','text-align','letter-spacing','text-transform','font-style','text-decoration','color',
            // spacing
            'margin','margin-top','margin-right','margin-bottom','margin-left','padding','padding-top','padding-right','padding-bottom','padding-left','gap',
            // border
            'border-width','border-style','border-color','border-radius',
            // background (use composite background prop)
            'background','background-color',
            // effects
            'opacity','transform','transition',
            // layout/alignment
            'display','flex-direction','flex-wrap','justify-content','align-items','align-self',
            // grid
            'grid-template-columns','grid-template-rows','grid-column','grid-row',
            // misc
            'float','clear',
        ];

        foreach ($properties as $css_property => $css_value) {
            try {
                error_log('CSS Utility Importer - Processing property: ' . $css_property . ' = "' . $css_value . '"');
                
                $elementor_property = $this->map_css_property_to_elementor($css_property);
                if ($elementor_property) {
                    error_log('CSS Utility Importer - Mapped to: ' . $elementor_property);
                    
                    if (!in_array($elementor_property, $allowed_props, true)) {
                        error_log('CSS Utility Importer - Property not allowed: ' . $elementor_property);
                        continue;
                    }
                    
                    // Expand shorthands before conversion
                    if ($elementor_property === 'margin' || $elementor_property === 'padding') {
                        $expanded = $this->expand_box_shorthand($elementor_property, $css_value);
                        foreach ($expanded as $k => $v) {
                            $converted_v = $this->convert_value($k, $v);
                            $raw_v = $this->create_raw_prop_value($k, $converted_v);
                            if ($raw_v !== null) {
                                $variant['props'][$k] = $raw_v;
                            }
                        }
                        continue;
                    }

                    // Special-case background-color to composite background prop
                    if ($elementor_property === 'background-color') {
                        $bg_value = $this->create_background_from_color($css_value);
                        if ($bg_value !== null) {
                            $variant['props']['background'] = $bg_value;
                        }
                        continue;
                    }

                    // Convert the CSS value to Elementor format first
                    $converted_value = $this->convert_value($elementor_property, $css_value);
                    // Use raw values that match Style_Parser expectations
                    $raw_value = $this->create_raw_prop_value($elementor_property, $converted_value);
                    if ($raw_value !== null) {
                        $variant['props'][$elementor_property] = $raw_value;
                        error_log('CSS Utility Importer - Added prop: ' . $elementor_property . ' = ' . json_encode($raw_value));
                    } else {
                        error_log('CSS Utility Importer - Typed value is null for: ' . $elementor_property);
                    }
                } else {
                    error_log('CSS Utility Importer - No mapping found for: ' . $css_property);
                }
            } catch (\Exception $e) {
                // Log the error but continue processing other properties
                error_log('CSS Utility Importer - Error mapping property ' . $css_property . ': ' . $e->getMessage());
                continue;
            }
        }
        
        // Only return variant if it has properties
        return !empty($variant['props']) ? $variant : null;
    }
    
    private function map_css_property_to_elementor($css_property) {
        return $this->elementor_property_mapping[$css_property] ?? null;
    }
    
    private function convert_value($elementor_property, $css_value) {
        // Check if there's a specific converter for this property
        if (isset($this->value_converters[$elementor_property])) {
            $converter = $this->value_converters[$elementor_property];
            return $this->$converter($css_value);
        }
        
        // Default conversion - return as is
        return $css_value;
    }
    
    private function convert_spacing_value($value) {
        // Convert spacing values (px, rem, em, etc.) to Elementor format
        if (preg_match('/^(\d+(?:\.\d+)?)(px|rem|em|%)$/', $value, $matches)) {
            $number = floatval($matches[1]);
            $unit = $matches[2];
            
            // Convert to Elementor's unit format
            switch ($unit) {
                case 'px':
                    return $number . 'px';
                case 'rem':
                    return $number . 'rem';
                case 'em':
                    return $number . 'em';
                case '%':
                    return $number . '%';
            }
        }
        
        return $value;
    }
    
    private function convert_font_size_value($value) {
        // Convert font size values
        if (preg_match('/^(\d+(?:\.\d+)?)(px|rem|em)$/', $value, $matches)) {
            $number = floatval($matches[1]);
            $unit = $matches[2];
            
            return $number . $unit;
        }
        
        return $value;
    }
    
    private function convert_font_weight_value($value) {
        // Normalize to numeric strings accepted by typography schema
        $weight_map = [
            'thin' => '100',
            'extralight' => '200',
            'ultralight' => '200',
            'light' => '300',
            'normal' => '400',
            'regular' => '400',
            'medium' => '500',
            'semibold' => '600',
            'demibold' => '600',
            'bold' => '700',
            'extrabold' => '800',
            'ultrabold' => '800',
            'black' => '900',
            'heavy' => '900'
        ];

        if (is_numeric($value)) {
            return (string) intval($value);
        }

        $key = strtolower(trim($value));
        return $weight_map[$key] ?? '400';
    }
    
    private function convert_color_value($value) {
        // Convert color values to Elementor format
        if (preg_match('/^#[0-9a-fA-F]{3,6}$/', $value)) {
            return $value;
        }
        
        if (preg_match('/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/', $value, $matches)) {
            $r = intval($matches[1]);
            $g = intval($matches[2]);
            $b = intval($matches[3]);
            return sprintf('#%02x%02x%02x', $r, $g, $b);
        }
        
        if (preg_match('/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/', $value, $matches)) {
            $r = intval($matches[1]);
            $g = intval($matches[2]);
            $b = intval($matches[3]);
            $a = floatval($matches[4]);
            return sprintf('rgba(%d, %d, %d, %s)', $r, $g, $b, $a);
        }
        
        return $value;
    }
    
    private function convert_border_radius_value($value) {
        // Convert border radius values
        if (preg_match('/^(\d+(?:\.\d+)?)(px|rem|em|%)$/', $value, $matches)) {
            $number = floatval($matches[1]);
            $unit = $matches[2];
            
            return $number . $unit;
        }
        
        return $value;
    }
    
    private function convert_box_shadow_value($value) {
        // Box-shadow is not a supported transformable prop directly; return null to avoid invalid_value
        return null;
    }
    
    private function convert_opacity_value($value) {
        // Convert opacity values
        if (preg_match('/^(\d+(?:\.\d+)?)$/', $value, $matches)) {
            $number = floatval($matches[1]);
            
            // If it's a decimal between 0 and 1, keep as is
            if ($number <= 1) {
                return $number;
            }
            
            // If it's a percentage, convert to decimal
            if ($number <= 100) {
                return $number / 100;
            }
        }
        
        return $value;
    }
    
    private function map_media_query_to_breakpoint($media_query) {
        // Map CSS media queries to Elementor breakpoints
        $breakpoint_map = [
            'max-width: 767px' => 'mobile',
            'max-width: 1024px' => 'tablet',
            'min-width: 1025px' => 'desktop',
            'min-width: 1440px' => 'widescreen'
        ];
        
        foreach ($breakpoint_map as $query => $breakpoint) {
            if (strpos($media_query, $query) !== false) {
                return $breakpoint;
            }
        }
        
        return null;
    }
    
    private function generate_elementor_class_id() {
        // Replicate Elementor's exact ID generation algorithm
        // From: prefix + '-' + Math.random().toString(16).substr(2, 7)
        // For global classes, prefix is 'g'
        
        // Generate a random integer to avoid float precision issues
        $random_int = mt_rand(0, 0xFFFFFFF); // 7 hex digits worth
        
        // Convert to hex string
        $hex_string = dechex($random_int);
        
        // Ensure we have exactly 7 characters, pad with zeros if needed
        $hex_string = str_pad($hex_string, 7, '0', STR_PAD_LEFT);
        
        // Take only 7 characters (in case it's longer)
        $hex_string = substr($hex_string, 0, 7);
        
        return 'g-' . $hex_string;
    }
    
    private function generate_class_label($class_name) {
        // Generate a human-readable label
        $label = str_replace(['-', '_'], ' ', $class_name);
        $label = ucwords($label);
        
        return $label;
    }
    
    public function add_custom_property_mapping($css_property, $elementor_property) {
        $this->elementor_property_mapping[$css_property] = $elementor_property;
    }
    
    public function add_custom_value_converter($elementor_property, $converter_method) {
        $this->value_converters[$elementor_property] = $converter_method;
    }
    
    /**
     * Get the prop type for a CSS property
     * 
     * @param string $css_property CSS property name
     * @return string Elementor prop type
     */
    private function get_prop_type($css_property) {
        $type_map = [
            // Colors
            'color' => 'color',
            'background-color' => 'color',
            'border-color' => 'color',
            
            // Sizes
            'width' => 'size',
            'height' => 'size',
            'min-width' => 'size',
            'min-height' => 'size',
            'max-width' => 'size',
            'max-height' => 'size',
            'padding-top' => 'size',
            'padding-right' => 'size',
            'padding-bottom' => 'size',
            'padding-left' => 'size',
            'margin-top' => 'size',
            'margin-right' => 'size',
            'margin-bottom' => 'size',
            'margin-left' => 'size',
            'font-size' => 'size',
            'line-height' => 'size',
            'border-radius' => 'size',
            'border-width' => 'size',
            'gap' => 'size',
            'top' => 'size',
            'right' => 'size',
            'bottom' => 'size',
            'left' => 'size',
            
            // Shorthand properties (treat as string for now)
            'padding' => 'string',
            'margin' => 'string',
            
            // Effects
            'box-shadow' => 'string',
            'opacity' => 'size',
            'z-index' => 'number',
            
            // Typography
            'font-weight' => 'string',
            'text-align' => 'string',
            'text-decoration' => 'string',
            'text-transform' => 'string',
            'font-style' => 'string',
            'letter-spacing' => 'string',
            
            // Layout
            'display' => 'string',
            'position' => 'string',
            'float' => 'string',
            'clear' => 'string',
            'overflow' => 'string',
            
            // Flexbox
            'flex-direction' => 'string',
            'flex-wrap' => 'string',
            'justify-content' => 'string',
            'align-items' => 'string',
            'align-self' => 'string',
            
            // Grid
            'grid-template-columns' => 'string',
            'grid-template-rows' => 'string',
            'grid-column' => 'string',
            'grid-row' => 'string',
            
            // Background
            'background-image' => 'string',
            'background-position' => 'string',
            'background-repeat' => 'string',
            'background-size' => 'string',
            
            // Border
            'border-style' => 'string',
            
            // Transform
            'transform' => 'string',
            'transition' => 'string',
        ];
        
        return $type_map[$css_property] ?? 'string';
    }
    
    /**
     * Create a typed prop value with proper $$type annotation
     * 
     * @param string $elementor_property Property name
     * @param mixed $css_value CSS value
     * @return array|null Typed prop value or null if invalid
     */
    private function create_raw_prop_value($elementor_property, $css_value) {
        $prop_type = $this->get_prop_type($elementor_property);
        
        switch ($prop_type) {
            case 'color':
                // Support global color variables via transformable union
                if (is_string($css_value) && stripos($css_value, 'var(') !== false) {
                    $varId = $this->maybe_resolve_color_variable_id($css_value);
                    if ($varId) {
                        return [ '$$type' => 'global-color-variable', 'value' => $varId ];
                    }
                    // Unresolvable variable: omit color to avoid invalid_value
                    return null;
                }
                // Literal color -> send as transformable color
                $literal = $this->convert_color_value($css_value);
                return [ '$$type' => 'color', 'value' => $literal ];
            case 'size': {
                // Skip variable-based sizes
                if (is_string($css_value) && stripos($css_value, 'var(') !== false) { return null; }
                // Opacity is a special size-like control that Elementor stores as percentage units
                if ($elementor_property === 'opacity') {
                    $parsed = $this->parse_opacity_value($css_value);
                    if ($parsed) {
                        return [ '$$type' => 'size', 'value' => [ 'size' => $parsed['value'], 'unit' => $parsed['unit'] ] ];
                    }
                    return null;
                }
                $parsed = $this->parse_size_value($css_value);
                if ($parsed) {
                    return [ '$$type' => 'size', 'value' => [ 'size' => $parsed['value'], 'unit' => $parsed['unit'] ] ];
                }
                return null;
            }
            case 'background':
                // handled via create_background_from_color
                return null;
            case 'number':
                return [ '$$type' => 'number', 'value' => intval($css_value) ];
            case 'string':
            default:
                return [ '$$type' => 'string', 'value' => (string) $css_value ];
        }
    }

    private function parse_opacity_value($css_value) {
        $v = trim((string) $css_value);
        // 0..1 -> convert to 0..100%
        if (preg_match('/^(0?\.\d+|1(?:\.0+)?)$/', $v)) {
            $num = floatval($v);
            return [ 'value' => max(0, min(100, round($num * 100))), 'unit' => '%' ];
        }
        // percentage like 42% or 80%
        if (preg_match('/^(\d+(?:\.\d+)?)\s*%$/', $v, $m)) {
            return [ 'value' => floatval($m[1]), 'unit' => '%' ];
        }
        // integer 0..100 treat as percent
        if (preg_match('/^(\d{1,3})$/', $v, $m)) {
            $num = intval($m[1]);
            if ($num >= 0 && $num <= 100) {
                return [ 'value' => $num, 'unit' => '%' ];
            }
        }
        return null;
    }

    private function create_background_from_color($css_value) {
        // Accept either literal color or color variable
        if (is_string($css_value) && stripos($css_value, 'var(') !== false) {
            $varId = $this->maybe_resolve_color_variable_id($css_value);
            if (! $varId) { return null; }
            return [
                '$$type' => 'background',
                'value' => [
                    'color' => [ '$$type' => 'global-color-variable', 'value' => $varId ]
                ]
            ];
        }

        $literal = $this->convert_color_value($css_value);
        return [
            '$$type' => 'background',
            'value' => [
                'color' => [ '$$type' => 'color', 'value' => $literal ]
            ]
        ];
    }

    private function expand_box_shorthand($type, $value) {
        // $type is 'margin' or 'padding'
        $value = trim($value);
        $parts = preg_split('/\s+/', $value);
        $t = $r = $b = $l = null;
        $count = count($parts);
        if ($count === 1) {
            $t = $r = $b = $l = $parts[0];
        } elseif ($count === 2) {
            $t = $b = $parts[0];
            $r = $l = $parts[1];
        } elseif ($count === 3) {
            $t = $parts[0];
            $r = $l = $parts[1];
            $b = $parts[2];
        } else {
            $t = $parts[0] ?? '0';
            $r = $parts[1] ?? $t;
            $b = $parts[2] ?? $t;
            $l = $parts[3] ?? $r;
        }
        $map = [];
        if ($t !== null) { $map[$type . '-top'] = $t; }
        if ($r !== null) { $map[$type . '-right'] = $r; }
        if ($b !== null) { $map[$type . '-bottom'] = $b; }
        if ($l !== null) { $map[$type . '-left'] = $l; }
        return $map;
    }

    private function maybe_resolve_color_variable_id($css_value) {
        if (!is_string($css_value)) { return null; }
        if (!preg_match('/^var\(\s*--([a-zA-Z0-9_-]+)\s*\)$/', trim($css_value), $m)) { return null; }
        $label = $m[1];
        // Lazy cache variables by label (case-insensitive)
        if (null === self::$cachedVariablesByLabel) {
            try {
                $vars = new VariablesIntegration();
                $list = $vars->list_variables();
                $map = [];
                if (!empty($list['success']) && !empty($list['variables'])) {
                    foreach ($list['variables'] as $id => $v) {
                        if (!empty($v['label'])) {
                            $map[strtolower($v['label'])] = $id;
                        }
                    }
                }
                self::$cachedVariablesByLabel = $map;
            } catch (\Throwable $__) {
                self::$cachedVariablesByLabel = [];
            }
        }
        $key = strtolower($label);
        return self::$cachedVariablesByLabel[$key] ?? null;
    }
    
    /**
     * Create a color prop value
     */
    private function create_color_prop($css_value) {
        $color_value = $this->convert_color_value($css_value);
        return $color_value;
    }
    
    /**
     * Create a size prop value
     */
    private function create_size_prop($css_value) {
        $parsed = $this->parse_size_value($css_value);
        if ($parsed) {
            return [ 'size' => $parsed['value'], 'unit' => $parsed['unit'] ];
        }
        return null;
    }
    
    /**
     * Create a dimensions prop value
     */
    private function create_dimensions_prop($css_value) {
        // For now, treat dimensions as size
        return $this->create_size_prop($css_value);
    }
    
    /**
     * Create a box-shadow prop value
     */
    private function create_box_shadow_prop($css_value) {
        return $css_value;
    }
    
    /**
     * Create a slider prop value
     */
    private function create_slider_prop($css_value) {
        if (strpos($css_value, '%') !== false) {
            return floatval($css_value) / 100;
        }
        return floatval($css_value);
    }
    
    /**
     * Create a number prop value
     */
    private function create_number_prop($css_value) {
        return intval($css_value);
    }
    
    /**
     * Create a string prop value
     */
    private function create_string_prop($css_value) {
        return $css_value;
    }
    
    /**
     * Parse a size value into value and unit
     */
    private function parse_size_value($css_value) {
        // Debug logging
        error_log('CSS Utility Importer - Parsing size value: "' . $css_value . '"');
        
        // Handle numeric values without units (treat as px for most, % for opacity)
        if (preg_match('/^(\d+(?:\.\d+)?)$/', $css_value, $matches)) {
            $result = [
                'value' => floatval($matches[1]),
                'unit' => 'px'
            ];
            error_log('CSS Utility Importer - Parsed size (numeric): ' . json_encode($result));
            return $result;
        }
        
        // Handle values with units
        if (preg_match('/^(\d+(?:\.\d+)?)(px|rem|em|%|vh|vw)$/', $css_value, $matches)) {
            $result = [
                'value' => floatval($matches[1]),
                'unit' => $matches[2]
            ];
            error_log('CSS Utility Importer - Parsed size (with unit): ' . json_encode($result));
            return $result;
        }
        
        error_log('CSS Utility Importer - Failed to parse size value: "' . $css_value . '"');
        return null;
    }
    
    /**
     * Validate class label according to Elementor's rules
     * 
     * @param string $label Class label to validate
     * @return string Sanitized label
     * @throws \Exception If validation fails
     */
    private function validate_class_label($label) {
        $label = trim($label);
        
        // Length validation: 1-50 characters (more lenient for CSS class names)
        if (strlen($label) < 1) {
            throw new \Exception('Class name too short. Minimum 1 character required.');
        }
        
        if (strlen($label) > 50) {
            throw new \Exception('Class name too long. Maximum 50 characters allowed.');
        }
        
        // Reserved names
        $reserved_names = ['container'];
        if (in_array(strtolower($label), $reserved_names, true)) {
            throw new \Exception('Class name "' . $label . '" is reserved.');
        }
        
        // Character validation: alphanumeric, hyphen, underscore only
        if (!preg_match('/^[a-zA-Z0-9_-]+$/', $label)) {
            throw new \Exception('Class name contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed.');
        }
        
        // Cannot start with digit
        if (preg_match('/^[0-9]/', $label)) {
            throw new \Exception('Class name cannot start with a digit.');
        }
        
        // Cannot start with double hyphen
        if (strpos($label, '--') === 0) {
            throw new \Exception('Class name cannot start with double hyphen.');
        }
        
        // Cannot start with hyphen followed by digit
        if (preg_match('/^-[0-9]/', $label)) {
            throw new \Exception('Class name cannot start with hyphen followed by digit.');
        }
        
        // No spaces
        if (strpos($label, ' ') !== false) {
            throw new \Exception('Class name cannot contain spaces.');
        }
        
        return $label;
    }
}
