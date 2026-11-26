<?php

define( 'ABSPATH', __DIR__ . '/' );
define( 'UP10_IG_ACCESS_TOKEN', 'old-token' );

$GLOBALS['up10_test_options'] = array(
	'up10_instagram_cache' => array(
		'items'     => array( array( 'id' => 'cached-post' ) ),
		'synced_at' => '2026-11-25 12:00:00',
		'error'     => 'previous_error',
	),
);

function add_filter() {}
function add_action() {}
function __( $text, $domain = null ) {
	unset( $domain );
	return $text;
}
function get_option( $name, $default = '' ) {
	return $GLOBALS['up10_test_options'][ $name ] ?? $default;
}
function update_option( $name, $value, $autoload = null ) {
	unset( $autoload );
	$GLOBALS['up10_test_options'][ $name ] = $value;
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

	return array(
		'response' => array( 'code' => 200 ),
		'body'     => json_encode(
			array(
				'access_token' => 'new-token',
				'token_type'   => 'bearer',
				'expires_in'   => 5183944,
			)
		),
	);
}
function wp_remote_retrieve_response_code( $response ) {
	return $response['response']['code'];
}
function wp_remote_retrieve_body( $response ) {
	return $response['body'];
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

$before = time();
$result = up10_instagram_refresh_token();
$after  = time();

if ( true !== $result ) {
	throw new RuntimeException( 'La renovación no devolvió éxito.' );
}

if ( 'new-token' !== get_option( 'up10_instagram_token' ) ) {
	throw new RuntimeException( 'No se guardó el token renovado.' );
}

$expires_at = (int) get_option( 'up10_instagram_token_expires_at', 0 );

if ( $expires_at < $before + 5183944 || $expires_at > $after + 5183944 ) {
	throw new RuntimeException( 'No se guardó el vencimiento del token.' );
}

$cache = get_option( 'up10_instagram_cache' );

if ( null !== $cache['error'] ) {
	throw new RuntimeException( 'La renovación no limpió el error anterior.' );
}

$request = $GLOBALS['up10_test_request'];

if ( 0 !== strpos( $request['url'], 'https://graph.instagram.com/refresh_access_token?' ) ) {
	throw new RuntimeException( 'La renovación no usó el endpoint oficial.' );
}

if ( false === strpos( $request['url'], 'grant_type=ig_refresh_token' ) ) {
	throw new RuntimeException( 'La renovación no envió grant_type.' );
}

if ( false === strpos( $request['url'], 'access_token=' . UP10_IG_ACCESS_TOKEN ) ) {
	throw new RuntimeException( 'La renovación no envió el token como query param.' );
}

if ( isset( $request['args']['headers']['Authorization'] ) ) {
	throw new RuntimeException( 'La renovación usó un encabezado Authorization no documentado.' );
}

echo "Renovación de token de Instagram: OK\n";
