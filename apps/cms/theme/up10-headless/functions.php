<?php
/**
 * Configuración mínima del tema headless.
 *
 * @package UP10_Headless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'after_setup_theme',
	static function () {
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
	}
);

/**
 * Redirige cualquier vista pública al frontend React.
 */
add_action(
	'template_redirect',
	static function () {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
			return;
		}

		$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
		$is_rest = ( defined( 'REST_REQUEST' ) && REST_REQUEST )
			|| false !== strpos( $request_uri, '/wp-json' )
			|| isset( $_GET['rest_route'] );

		if ( $is_rest ) {
			return;
		}

		$frontend = defined( 'UP10_FRONTEND_URL' ) ? UP10_FRONTEND_URL : 'https://up10.cl';

		wp_redirect( $frontend, 302 );
		exit;
	}
);
