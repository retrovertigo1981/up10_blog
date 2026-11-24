<?php
/**
 * Plugin Name: UP10 Core
 * Plugin URI: https://up10.cl
 * Description: CMS headless de UP10: tipos de contenido, campos, API y hardening.
 * Version: 0.1.1
 * Requires at least: 6.9
 * Requires PHP: 8.1
 * Author: UP10
 * Text Domain: up10-core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'UP10_CORE_VERSION', '0.1.1' );
define( 'UP10_CORE_PATH', plugin_dir_path( __FILE__ ) );
define( 'UP10_CORE_URL', plugin_dir_url( __FILE__ ) );

require_once UP10_CORE_PATH . 'includes/content-types.php';
require_once UP10_CORE_PATH . 'includes/fields.php';
require_once UP10_CORE_PATH . 'includes/media.php';
require_once UP10_CORE_PATH . 'includes/serializers.php';
require_once UP10_CORE_PATH . 'includes/rest.php';
require_once UP10_CORE_PATH . 'includes/admin.php';
require_once UP10_CORE_PATH . 'includes/hardening.php';

add_action( 'init', 'up10_register_taxonomies', 5 );
add_action( 'init', 'up10_register_post_types', 5 );
add_action( 'after_setup_theme', 'up10_setup_image_sizes' );
add_action( 'acf/init', 'up10_register_options_pages' );
add_action( 'acf/init', 'up10_register_field_groups' );
add_action( 'rest_api_init', 'up10_register_rest_routes' );

/**
 * Aviso si Secure Custom Fields no está activo.
 */
function up10_scf_notice() {
	if ( function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>';
	echo esc_html__( 'UP10 Core necesita Secure Custom Fields activo para mostrar los campos editoriales.', 'up10-core' );
	echo '</p></div>';
}
add_action( 'admin_notices', 'up10_scf_notice' );

/**
 * Activación: registra tipos, siembra términos y refresca rewrite rules.
 */
function up10_activate() {
	up10_register_taxonomies();
	up10_register_post_types();
	up10_seed_terms();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'up10_activate' );

/**
 * Desactivación: limpia rewrite rules.
 */
function up10_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'up10_deactivate' );
