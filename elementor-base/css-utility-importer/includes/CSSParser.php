<?php

namespace CSSUtilityImporter;

class CSSParser {
    
    private $utility_patterns = [
        // Spacing utilities
        'margin' => '/^m[trblxy]?-\d*$/',
        'padding' => '/^p[trblxy]?-\d*$/',
        'gap' => '/^gap-[xy]?-\d*$/',
        
        // Typography utilities
        'font_size' => '/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/',
        'font_weight' => '/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/',
        'text_align' => '/^text-(left|center|right|justify)$/',
        'line_height' => '/^leading-(none|tight|snug|normal|relaxed|loose|\d+)$/',
        
        // Color utilities - more generic patterns
        'text_color' => '/^text-(black|white|gray-\d+|red-\d+|blue-\d+|green-\d+|yellow-\d+|purple-\d+|pink-\d+|indigo-\d+|orange-\d+|primary|secondary)$/',
        'bg_color' => '/^bg-(black|white|gray-\d+|red-\d+|blue-\d+|green-\d+|yellow-\d+|purple-\d+|pink-\d+|indigo-\d+|orange-\d+|primary|secondary)$/',
        'border_color' => '/^border-(black|white|gray-\d+|red-\d+|blue-\d+|green-\d+|yellow-\d+|purple-\d+|pink-\d+|indigo-\d+|orange-\d+|primary|secondary|accent)$/',
        
        // Layout utilities
        'display' => '/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/',
        'position' => '/^(static|relative|absolute|fixed|sticky)$/',
        'float' => '/^(float-left|float-right|float-none)$/',
        'clear' => '/^(clear-left|clear-right|clear-both|clear-none)$/',
        
        // Flexbox utilities
        'flex_direction' => '/^flex-(row|row-reverse|col|col-reverse)$/',
        'flex_wrap' => '/^flex-(wrap|wrap-reverse|nowrap)$/',
        'justify_content' => '/^justify-(start|end|center|between|around|evenly)$/',
        'align_items' => '/^items-(start|end|center|baseline|stretch)$/',
        'align_self' => '/^self-(auto|start|end|center|stretch|baseline)$/',
        
        // Grid utilities
        'grid_cols' => '/^grid-cols-\d*$/',
        'grid_rows' => '/^grid-rows-\d*$/',
        'col_span' => '/^col-span-\d*$/',
        'row_span' => '/^row-span-\d*$/',
        
        // Border utilities
        'border_width' => '/^border-[trblxy]?-\d*$/',
        'border_radius' => '/^rounded-[trblxy]?(-(none|sm|md|lg|xl|2xl|3xl|full))?$/',
        'border_style' => '/^border-(solid|dashed|dotted|double|none)$/',
        
        // Shadow utilities
        'box_shadow' => '/^shadow(-(sm|md|lg|xl|2xl|inner|none))?$/',
        
        // Opacity utilities
        'opacity' => '/^opacity-\d+$/',
        
        // Transform utilities
        'transform' => '/^(scale|rotate|translate|skew)-[xy]?-\d+$/',
        
        // Transition utilities
        'transition' => '/^transition(-(none|all|colors|opacity|shadow|transform))?$/',
        
        // Generic utility classes (catch-all for simple class names)
        'generic_utility' => '/^[a-zA-Z][a-zA-Z0-9_-]*$/',
        
        // Custom patterns (can be extended)
        'custom' => []
    ];
    
    private $property_mapping = [
        'margin' => 'margin',
        'padding' => 'padding',
        'gap' => 'gap',
        'font_size' => 'font-size',
        'font_weight' => 'font-weight',
        'text_align' => 'text-align',
        'line_height' => 'line-height',
        'text_color' => 'color',
        'bg_color' => 'background-color',
        'border_color' => 'border-color',
        'display' => 'display',
        'position' => 'position',
        'float' => 'float',
        'clear' => 'clear',
        'flex_direction' => 'flex-direction',
        'flex_wrap' => 'flex-wrap',
        'justify_content' => 'justify-content',
        'align_items' => 'align-items',
        'align_self' => 'align-self',
        'grid_cols' => 'grid-template-columns',
        'grid_rows' => 'grid-template-rows',
        'col_span' => 'grid-column',
        'row_span' => 'grid-row',
        'border_width' => 'border-width',
        'border_radius' => 'border-radius',
        'border_style' => 'border-style',
        'box_shadow' => 'box-shadow',
        'opacity' => 'opacity',
        'transform' => 'transform',
        'transition' => 'transition',
        'generic_utility' => 'generic'
    ];
    
    public function parse_css($css_content) {
        $classes = [];
        $css_rules = $this->extract_css_rules($css_content);
        
        error_log('CSS Utility Importer: Extracted ' . count($css_rules) . ' CSS rules');
        
        foreach ($css_rules as $rule) {
            $utility_class = $this->extract_utility_class($rule['selector']);
            
            if ($utility_class) {
                error_log('CSS Utility Importer: Found utility class: ' . $utility_class['name'] . ' (type: ' . $utility_class['type'] . ')');
                
                $properties = $this->parse_properties($rule['declarations']);
                $mapped_properties = $this->map_properties($utility_class, $properties);
                
                if (!empty($mapped_properties)) {
                    $classes[$utility_class['name']] = [
                        'name' => $utility_class['name'],
                        'type' => $utility_class['type'],
                        'properties' => $mapped_properties,
                        'original_css' => $rule['css'],
                        'media_queries' => $rule['media_queries'] ?? [],
                        'pseudo_classes' => $rule['pseudo_classes'] ?? []
                    ];
                    error_log('CSS Utility Importer: Mapped properties for ' . $utility_class['name'] . ': ' . print_r($mapped_properties, true));
                } else {
                    error_log('CSS Utility Importer: No mapped properties for ' . $utility_class['name']);
                }
            } else {
                error_log('CSS Utility Importer: No utility class found for selector: ' . $rule['selector']);
            }
        }
        
        error_log('CSS Utility Importer: Total classes parsed: ' . count($classes));
        // Fallback: if no classes matched our utility patterns, do a generic
        // class selector capture for full CSS files.
        if (empty($classes)) {
            $generic = $this->parse_css_fallback_classes($css_content);
            if (!empty($generic)) {
                error_log('CSS Utility Importer: Fallback parsed classes: ' . count($generic));
                return $generic;
            }
        }
        return $classes;
    }

    // Extract CSS custom properties from :root
    public function extract_root_variables($css_content) {
        $vars = [];
        if (!is_string($css_content) || $css_content === '') {
            return $vars;
        }
        // Remove comments to avoid false positives
        $clean = preg_replace('/\/\*.*?\*\//s', '', $css_content);
        // Find all :root blocks across a full CSS file
        if (preg_match_all('/:root\s*\{([\s\S]*?)\}/', $clean, $blocks, PREG_SET_ORDER)) {
            foreach ($blocks as $blockMatch) {
                $rootBlock = $blockMatch[1];
                // Match declarations that may span multiple lines until the semicolon
                if (preg_match_all('/--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/s', $rootBlock, $matches, PREG_SET_ORDER)) {
                    foreach ($matches as $mm) {
                        $name = trim($mm[1]);
                        $value = trim($mm[2]);
                        // Collapse internal whitespace sequences to single spaces except inside parentheses
                        $value = preg_replace('/\s+/', ' ', $value);
                        if ($name !== '') {
                            $vars[$name] = $value;
                        }
                    }
                }
            }
        }
        return $vars;
    }

    // Extract all CSS custom properties declared anywhere (not only :root)
    public function extract_all_variables($css_content) {
        $vars = [];
        if (!is_string($css_content) || $css_content === '') { return $vars; }
        $clean = preg_replace('/\/\*.*?\*\//s', '', $css_content);
        if (preg_match_all('/--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/s', $clean, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $m) {
                $name = trim($m[1]);
                $value = trim(preg_replace('/\s+/', ' ', $m[2]));
                if ($name !== '') { $vars[$name] = $value; }
            }
        }
        return $vars;
    }

    // Generic fallback parser: capture any .class { ... } block and build minimal entries
    private function parse_css_fallback_classes($css_content) {
        $result = [];
        if (!is_string($css_content) || $css_content === '') { return $result; }
        $clean = preg_replace('/\/\*.*?\*\//s', '', $css_content);
        if (preg_match_all('/\.(?<name>[a-zA-Z0-9_-]+)\s*\{(?<body>[\s\S]*?)\}/', $clean, $blocks, PREG_SET_ORDER)) {
            foreach ($blocks as $b) {
                $name = trim($b['name']);
                $body = $b['body'];
                $props = [];
                // Split by semicolons safely
                $parts = preg_split('/;\s*/', $body);
                foreach ($parts as $part) {
                    $part = trim($part);
                    if ($part === '') continue;
                    $colon = strpos($part, ':');
                    if ($colon === false) continue;
                    $key = trim(substr($part, 0, $colon));
                    $val = trim(substr($part, $colon + 1));
                    if ($key !== '' && $val !== '') { $props[$key] = $val; }
                }
                if (!empty($props)) {
                    $result[$name] = [
                        'name' => $name,
                        'type' => 'class',
                        'properties' => $props,
                        'original_css' => '.' . $name . ' { ' . $body . ' }',
                        'media_queries' => [],
                        'pseudo_classes' => []
                    ];
                }
            }
        }
        return $result;
    }
    
    private function extract_css_rules($css_content) {
        $rules = [];
        
        // Remove comments
        $css_content = preg_replace('/\/\*.*?\*\//s', '', $css_content);
        
        // Handle media queries
        $media_queries = [];
        $css_content = preg_replace_callback(
            '/@media\s+([^{]+)\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/',
            function($matches) use (&$media_queries) {
                $media_query = trim($matches[1]);
                $content = $matches[2];
                
                // Extract rules from media query
                preg_match_all('/([^{}]+)\{([^{}]+)\}/', $content, $sub_matches, PREG_SET_ORDER);
                
                foreach ($sub_matches as $sub_match) {
                    $media_queries[] = [
                        'selector' => trim($sub_match[1]),
                        'declarations' => trim($sub_match[2]),
                        'media_query' => $media_query,
                        'css' => $sub_match[0]
                    ];
                }
                
                return '';
            },
            $css_content
        );
        
        // Extract regular rules
        preg_match_all('/([^{}]+)\{([^{}]+)\}/', $css_content, $matches, PREG_SET_ORDER);
        
        foreach ($matches as $match) {
            $rules[] = [
                'selector' => trim($match[1]),
                'declarations' => trim($match[2]),
                'css' => $match[0]
            ];
        }
        
        // Add media query rules
        $rules = array_merge($rules, $media_queries);
        
        return $rules;
    }
    
    private function extract_utility_class($selector) {
        // Remove pseudo-classes and pseudo-elements
        $clean_selector = preg_replace('/:[a-z-]+/', '', $selector);
        $clean_selector = preg_replace('/::[a-z-]+/', '', $clean_selector);
        
        // Remove class selector prefix
        $clean_selector = preg_replace('/^\./', '', $clean_selector);
        
        // Check if it matches any utility pattern
        foreach ($this->utility_patterns as $type => $pattern) {
            if (!is_string($pattern) || $pattern === '') {
                continue;
            }
            if (preg_match($pattern, $clean_selector)) {
                return [
                    'name' => $clean_selector,
                    'type' => $type,
                    'original_selector' => $selector
                ];
            }
        }
        
        return null;
    }
    
    private function parse_properties($declarations) {
        $properties = [];
        
        // Split by semicolon and parse each declaration
        $declaration_parts = explode(';', $declarations);
        
        foreach ($declaration_parts as $part) {
            $part = trim($part);
            if (empty($part)) continue;
            
            $colon_pos = strpos($part, ':');
            if ($colon_pos === false) continue;
            
            $property = trim(substr($part, 0, $colon_pos));
            $value = trim(substr($part, $colon_pos + 1));
            
            $properties[$property] = $value;
        }
        
        return $properties;
    }
    
    private function map_properties($utility_class, $properties) {
        $mapped = [];
        $type = $utility_class['type'];
        
        // Map properties based on utility type
        switch ($type) {
            case 'margin':
                $mapped = $this->map_spacing_properties($properties, 'margin');
                break;
            case 'padding':
                $mapped = $this->map_spacing_properties($properties, 'padding');
                break;
            case 'font_size':
                $mapped = $this->map_typography_properties($properties);
                break;
            case 'text_color':
                $mapped = $this->map_color_properties($properties, 'color');
                break;
            case 'bg_color':
                $mapped = $this->map_color_properties($properties, 'background-color');
                break;
            case 'border_color':
                $mapped = $this->map_color_properties($properties, 'border-color');
                break;
            case 'display':
                $mapped = $this->map_display_properties($properties);
                break;
            case 'flex_direction':
                $mapped = $this->map_flexbox_properties($properties);
                break;
            case 'justify_content':
                $mapped = $this->map_flexbox_properties($properties);
                break;
            case 'align_items':
                $mapped = $this->map_flexbox_properties($properties);
                break;
            case 'border_radius':
                $mapped = $this->map_border_properties($properties);
                break;
            case 'box_shadow':
                $mapped = $this->map_shadow_properties($properties);
                break;
            case 'generic_utility':
                // For generic utilities, map all properties as-is
                $mapped = $properties;
                break;
            default:
                // Generic property mapping
                foreach ($properties as $prop => $value) {
                    if (isset($this->property_mapping[$type])) {
                        $mapped[$this->property_mapping[$type]] = $value;
                    }
                }
        }
        
        return $mapped;
    }
    
    private function map_spacing_properties($properties, $type) {
        $mapped = [];
        
        foreach ($properties as $prop => $value) {
            if (strpos($prop, $type) === 0) {
                $direction = substr($prop, strlen($type));
                if (empty($direction)) {
                    $mapped[$type] = $value;
                } else {
                    $mapped[$type . $direction] = $value;
                }
            }
        }
        
        return $mapped;
    }
    
    private function map_typography_properties($properties) {
        $mapped = [];
        
        foreach ($properties as $prop => $value) {
            switch ($prop) {
                case 'font-size':
                    $mapped['font-size'] = $value;
                    break;
                case 'font-weight':
                    $mapped['font-weight'] = $value;
                    break;
                case 'line-height':
                    $mapped['line-height'] = $value;
                    break;
                case 'text-align':
                    $mapped['text-align'] = $value;
                    break;
            }
        }
        
        return $mapped;
    }
    
    private function map_color_properties($properties, $type) {
        $mapped = [];
        
        foreach ($properties as $prop => $value) {
            if ($prop === $type) {
                $mapped[$type] = $value;
            }
        }
        
        return $mapped;
    }
    
    private function map_display_properties($properties) {
        $mapped = [];
        
        foreach ($properties as $prop => $value) {
            if ($prop === 'display') {
                $mapped['display'] = $value;
            }
        }
        
        return $mapped;
    }
    
    private function map_flexbox_properties($properties) {
        $mapped = [];
        
        foreach ($properties as $prop => $value) {
            switch ($prop) {
                case 'flex-direction':
                    $mapped['flex-direction'] = $value;
                    break;
                case 'flex-wrap':
                    $mapped['flex-wrap'] = $value;
                    break;
                case 'justify-content':
                    $mapped['justify-content'] = $value;
                    break;
                case 'align-items':
                    $mapped['align-items'] = $value;
                    break;
                case 'align-self':
                    $mapped['align-self'] = $value;
                    break;
            }
        }
        
        return $mapped;
    }
    
    private function map_border_properties($properties) {
        $mapped = [];
        
        foreach ($properties as $prop => $value) {
            switch ($prop) {
                case 'border-radius':
                    $mapped['border-radius'] = $value;
                    break;
                case 'border-width':
                    $mapped['border-width'] = $value;
                    break;
                case 'border-style':
                    $mapped['border-style'] = $value;
                    break;
                case 'border-color':
                    $mapped['border-color'] = $value;
                    break;
            }
        }
        
        return $mapped;
    }
    
    private function map_shadow_properties($properties) {
        $mapped = [];
        
        foreach ($properties as $prop => $value) {
            if ($prop === 'box-shadow') {
                $mapped['box-shadow'] = $value;
            }
        }
        
        return $mapped;
    }
    
    public function add_custom_pattern($type, $pattern) {
        $this->utility_patterns['custom'][$type] = $pattern;
    }
    
    public function get_utility_patterns() {
        return $this->utility_patterns;
    }
}
