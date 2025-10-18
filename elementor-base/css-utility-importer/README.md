# Skelementor – Install & Test Guide

Skelementor lets you paste CSS and import its utility classes and custom variables directly into Elementor v4.

## Requirements
- WordPress 6.0+
- PHP 8.0+
- Elementor Core 3.32.3 (exact)
- Elementor Pro 3.32.2 (exact)

## Install
Option A — Manual (recommended for this build):
1. Unzip this plugin.
2. Move the entire folder `css-utility-importer` into `wp-content/plugins/`.
3. In WordPress Admin, go to Plugins and Activate “Skelementor”.

Option B — ZIP upload:
1. Zip the folder named `skelementor-v4` (the ZIP must contain this folder at the top level).
2. In WordPress Admin, go to Plugins → Add New → Upload Plugin.
3. Select the ZIP → Install → Activate.

## After activation
- You’ll see a new top‑level admin menu: “Skelementor” (with the S icon).
- If Elementor v4 features are not active, Skelementor will prompt you to enable them.

Compatibility note: This build is tested strictly with Elementor Core 3.32.3 and Elementor Pro 3.32.2. Using different versions may cause unexpected issues.

## Import test CSS
1. Open Admin → Skelementor.
2. Paste the contents of `test.css` (included in this plugin folder) into the “CSS Content” box.
3. Click “Preview Parse” to see detected classes and variables.
4. Click “Import Into Elementor” to save them to the active Kit.
5. Click on "Sync With Elementor" to finalize everything.
6. You may/may not need to refresh variables. The class import handles variable import too.
7. If you use any other CSS file, make sure the number of custom classes and variables each do not exceed 50. This causes various bugs in the UI.

## Verify in Elementor
- Open the Elementor editor on any page.
- Variables: Open the Variables Manager panel and confirm the color/font variables exist.
- Classes: Use Atomic widgets/classes or inspect the Kit CSS to see declarations applied.

## Regenerate assets (if needed)
- Elementor → Tools → Regenerate Files & Data.

## Uninstall
- Deactivate Skelementor from the Plugins page. No additional steps required.

---
Company: https://skelementor.com

Author: Rajin Khan — https://rajinkhan.com
