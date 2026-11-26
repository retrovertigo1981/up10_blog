<?php

define( 'ABSPATH', __DIR__ . '/' );
define( 'MINUTE_IN_SECONDS', 60 );
define( 'UP10_IG_ACCESS_TOKEN', 'instagram-test-token' );

$GLOBALS['up10_test_options'] = array(
	'instagram_mode'       => 'api',
	'up10_instagram_cache' => array(
		'items'     => array( array( 'id' => 'cached-post' ) ),
		'synced_at' => '2026-11-25 12:00:00',
		'error'     => null,
	),
);

function add_filter() {}
function add_action() {}
function __( $text, $domain = null ) {
	unset( $domain );
	return $text;
}
function up10_field( $name, $post_id, $default = '' ) {
	unset( $post_id );
	return 'instagram_mode' === $name ? $GLOBALS['up10_test_options']['instagram_mode'] : $default;
}
function get_option( $name, $default = '' ) {
	return $GLOBALS['up10_test_options'][ $name ] ?? $default;
}
function update_option( $name, $value, $autoload = null ) {
	unset( $autoload );
	$GLOBALS['up10_test_options'][ $name ] = $value;
	return true;
}
function get_transient() {
	return false;
}
function set_transient() {
	return true;
}
function delete_transient() {
	return true;
}
function is_wp_error( $value ) {
	return $value instanceof WP_Error;
}
function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( $key ) );
}
function add_query_arg( $query, $url ) {
	return $url . '?' . http_build_query( $query );
}
function wp_remote_get( $url, $args ) {
	$GLOBALS['up10_test_request'] = array(
		'url'  => $url,
		'args' => $args,
	);
	return new WP_Error( 'test_network_failure', 'Test-only simulated network failure.' );
}

class WP_Error {
	private $code;
	private $message;

	public function __construct( $code, $message ) {
		$this->code    = $code;
		$this->message = $message;
	}

	public function get_error_code() {
		return $this->code;
	}

	public function get_error_message() {
		return $this->message;
	}
}

require_once dirname( __DIR__ ) . '/includes/instagram.php';

$result = up10_instagram_sync( true );
$cache  = get_option( 'up10_instagram_cache' );

if ( ! is_wp_error( $result ) ) {
	throw new RuntimeException( 'Se esperaba un error de sincronización.' );
}

if (
	array( array( 'id' => 'cached-post' ) ) !== $cache['items']
	|| '2026-11-25 12:00:00' !== $cache['synced_at']
) {
	throw new RuntimeException( 'La sincronización fallida alteró la caché existente.' );
}

if ( 'up10_instagram_request_failed' !== $cache['error'] ) {
	throw new RuntimeException( 'No se guardó el código seguro del error.' );
}

$request = $GLOBALS['up10_test_request'];

if ( 0 !== strpos( $request['url'], 'https://graph.instagram.com/me/media?' ) ) {
	throw new RuntimeException( 'La solicitud no usó la ruta /me/media sin versión.' );
}

if ( false === strpos( $request['url'], 'access_token=' . UP10_IG_ACCESS_TOKEN ) ) {
	throw new RuntimeException( 'La solicitud no envió el token como query param.' );
}

if ( isset( $request['args']['headers']['Authorization'] ) ) {
	throw new RuntimeException( 'La solicitud usó un encabezado Authorization no documentado.' );
}

if ( false !== strpos( $result->get_error_message(), UP10_IG_ACCESS_TOKEN ) ) {
	throw new RuntimeException( 'El token apareció en el mensaje de error.' );
}

echo "Caché de Instagram ante fallos: OK\n";
