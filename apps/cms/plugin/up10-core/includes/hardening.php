<?php
/**
 * Endurecimiento básico del CMS headless.
 *
 * @package UP10_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * XML-RPC no se usa en este proyecto.
 */
add_filter( 'xmlrpc_enabled', '__return_false' );

/**
 * Comentarios y pingbacks cerrados.
 */
add_filter( 'comments_open', '__return_false' );
add_filter( 'pings_open', '__return_false' );

/**
 * Oculta la versión de WordPress en el head.
 */
remove_action( 'wp_head', 'wp_generator' );

/**
 * Quita la enumeración pública de usuarios vía REST.
 *
 * @param array $endpoints Endpoints.
 * @return array
 */
function up10_remove_public_user_endpoints( $endpoints ) {
	if ( is_user_logged_in() ) {
		return $endpoints;
	}

	unset( $endpoints['/wp/v2/users'] );
	unset( $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );

	return $endpoints;
}
add_filter( 'rest_endpoints', 'up10_remove_public_user_endpoints' );

/**
 * Cabeceras de seguridad mínimas.
 */
function up10_send_security_headers() {
	if ( headers_sent() ) {
		return;
	}

	header( 'X-Content-Type-Options: nosniff' );
	header( 'X-Frame-Options: SAMEORIGIN' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
}
add_action( 'send_headers', 'up10_send_security_headers' );
