<?php
/**
 * Sincronización de publicaciones de Instagram.
 *
 * @package UP10_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lee la caché local, sin exponerla ni modificarla.
 *
 * @return array
 */
function up10_instagram_cache() {
	$cache = get_option( 'up10_instagram_cache', array() );

	if ( ! is_array( $cache ) ) {
		$cache = array();
	}

	$cache = array_merge(
		array(
			'items'     => array(),
			'synced_at' => '',
			'error'     => null,
		),
		$cache
	);

	if ( ! is_array( $cache['items'] ) ) {
		$cache['items'] = array();
	}

	return $cache;
}

/**
 * Devuelve el modo editorial de Instagram.
 *
 * @return string
 */
function up10_instagram_mode() {
	$mode = (string) up10_field( 'instagram_mode', 'option', 'curated' );

	return in_array( $mode, array( 'api', 'curated' ), true ) ? $mode : 'curated';
}

/**
 * Recupera el token guardado y lo inicializa desde wp-config.php si hace falta.
 *
 * @return string
 */
function up10_instagram_token() {
	$token = get_option( 'up10_instagram_token', '' );

	if ( is_string( $token ) && '' !== trim( $token ) ) {
		return trim( $token );
	}

	if ( ! defined( 'UP10_IG_ACCESS_TOKEN' ) || '' === trim( (string) UP10_IG_ACCESS_TOKEN ) ) {
		return '';
	}

	$token = trim( (string) UP10_IG_ACCESS_TOKEN );
	update_option( 'up10_instagram_token', $token, false );

	if ( ! get_option( 'up10_instagram_token_updated_at' ) ) {
		update_option( 'up10_instagram_token_updated_at', time(), false );
	}

	return $token;
}

/**
 * Devuelve la versión de Graph API configurada por el operador.
 *
 * @return string|WP_Error
 */
function up10_instagram_api_version() {
	$version = defined( 'UP10_IG_API_VERSION' ) ? (string) UP10_IG_API_VERSION : '';

	if ( ! preg_match( '/^v[0-9]+\.[0-9]+$/D', $version ) ) {
		return new WP_Error(
			'up10_instagram_api_version_missing',
			__( 'Configura UP10_IG_API_VERSION con la versión vigente de la aplicación de Meta.', 'up10-core' )
		);
	}

	return $version;
}

/**
 * Devuelve el ID de la cuenta autorizado por la app de Meta.
 *
 * @return string|WP_Error
 */
function up10_instagram_user_id() {
	$user_id = defined( 'UP10_IG_USER_ID' ) ? trim( (string) UP10_IG_USER_ID ) : '';

	if ( ! preg_match( '/^[0-9]+$/D', $user_id ) ) {
		return new WP_Error(
			'up10_instagram_user_id_missing',
			__( 'Configura UP10_IG_USER_ID con el ID de la cuenta autorizada.', 'up10-core' )
		);
	}

	return $user_id;
}

/**
 * Solicita datos a Instagram sin incluir el token en la URL ni en mensajes de error.
 *
 * @param string $path  Ruta permitida de Graph API.
 * @param array  $query Parámetros de consulta.
 * @return array|WP_Error
 */
function up10_instagram_request( $path, $query = array() ) {
	$token = up10_instagram_token();

	if ( '' === $token ) {
		return new WP_Error(
			'up10_instagram_token_missing',
			__( 'No está configurado el token de Instagram.', 'up10-core' )
		);
	}

	$path = trim( (string) $path, '/' );

	if ( 'refresh_access_token' !== $path && ! preg_match( '/^[0-9]+\/media$/D', $path ) ) {
		return new WP_Error(
			'up10_instagram_invalid_path',
			__( 'La ruta solicitada a Instagram no está permitida.', 'up10-core' )
		);
	}

	if ( 'refresh_access_token' === $path ) {
		$url = 'https://graph.instagram.com/refresh_access_token';
	} else {
		$version = up10_instagram_api_version();

		if ( is_wp_error( $version ) ) {
			return $version;
		}

		$url = 'https://graph.instagram.com/' . $version . '/' . $path;
	}

	$response = wp_remote_get(
		add_query_arg( $query, $url ),
		array(
			'timeout'     => 15,
			'redirection' => 0,
			'headers'     => array(
				'Accept'        => 'application/json',
				'Authorization' => 'Bearer ' . $token,
			),
		)
	);

	if ( is_wp_error( $response ) ) {
		return new WP_Error(
			'up10_instagram_request_failed',
			__( 'No se pudo conectar con Instagram. Se conserva la última caché.', 'up10-core' )
		);
	}

	if ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
		return new WP_Error(
			'up10_instagram_api_failed',
			__( 'Instagram rechazó la solicitud. Se conserva la última caché.', 'up10-core' )
		);
	}

	$data = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( ! is_array( $data ) || isset( $data['error'] ) ) {
		return new WP_Error(
			'up10_instagram_invalid_response',
			__( 'Instagram devolvió una respuesta inválida. Se conserva la última caché.', 'up10-core' )
		);
	}

	return $data;
}

/**
 * Normaliza una publicación de Graph API a los campos que necesita el sitio.
 *
 * @param array $item Publicación de Instagram.
 * @return array|null
 */
function up10_instagram_normalize( $item ) {
	if ( ! is_array( $item ) || empty( $item['id'] ) || empty( $item['permalink'] ) ) {
		return null;
	}

	$media_type = strtoupper( (string) ( $item['media_type'] ?? '' ) );
	$type       = '';
	$image_url  = '';

	if ( 'IMAGE' === $media_type ) {
		$type      = 'image';
		$image_url = (string) ( $item['media_url'] ?? '' );
	} elseif ( 'CAROUSEL_ALBUM' === $media_type ) {
		$type     = 'carousel';
		$children = $item['children']['data'] ?? array();

		if ( is_array( $children ) ) {
			foreach ( $children as $child ) {
				if ( ! is_array( $child ) ) {
					continue;
				}

				$image_url = (string) ( $child['media_url'] ?? $child['thumbnail_url'] ?? '' );

				if ( '' !== $image_url ) {
					break;
				}
			}
		}

		if ( '' === $image_url ) {
			$image_url = (string) ( $item['thumbnail_url'] ?? '' );
		}
	} elseif ( in_array( $media_type, array( 'VIDEO', 'REEL' ), true ) ) {
		$type      = 'video';
		$image_url = (string) ( $item['thumbnail_url'] ?? '' );
	}

	if ( '' === $type || '' === $image_url || ! filter_var( $item['permalink'], FILTER_VALIDATE_URL ) ) {
		return null;
	}

	return array(
		'id'          => (string) $item['id'],
		'media_url'   => $image_url,
		'caption'     => (string) ( $item['caption'] ?? '' ),
		'permalink'   => (string) $item['permalink'],
		'type'        => $type,
		'publishedAt' => (string) ( $item['timestamp'] ?? '' ),
	);
}

/**
 * Descarga y normaliza las últimas publicaciones.
 *
 * @return array|WP_Error
 */
function up10_instagram_fetch_media() {
	$user_id = up10_instagram_user_id();

	if ( is_wp_error( $user_id ) ) {
		return $user_id;
	}

	$response = up10_instagram_request(
		$user_id . '/media',
		array(
			'fields' => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_url,media_type,thumbnail_url}',
			'limit'  => 10,
		)
	);

	if ( is_wp_error( $response ) ) {
		return $response;
	}

	if ( ! isset( $response['data'] ) || ! is_array( $response['data'] ) ) {
		return new WP_Error(
			'up10_instagram_media_missing',
			__( 'Instagram no devolvió una lista de publicaciones.', 'up10-core' )
		);
	}

	$items = array();

	foreach ( array_slice( $response['data'], 0, 10 ) as $item ) {
		$normalized = up10_instagram_normalize( $item );

		if ( $normalized ) {
			$items[] = $normalized;
		}
	}

	return $items;
}

/**
 * Comprueba que una imagen provenga de un dominio de medios de Meta.
 *
 * @param string $url URL a validar.
 * @return bool
 */
function up10_instagram_media_url_allowed( $url ) {
	$host = strtolower( (string) wp_parse_url( $url, PHP_URL_HOST ) );

	if ( ! $host || ! wp_http_validate_url( $url ) || 'https' !== wp_parse_url( $url, PHP_URL_SCHEME ) ) {
		return false;
	}

	foreach ( array( 'cdninstagram.com', 'fbcdn.net', 'fbsbx.com' ) as $domain ) {
		if ( $host === $domain || str_ends_with( $host, '.' . $domain ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Descarga una imagen y la reutiliza en futuras sincronizaciones.
 *
 * @param array $media Publicación normalizada.
 * @return int|WP_Error
 */
function up10_instagram_sideload( $media ) {
	$existing = get_posts(
		array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_key'       => '_up10_ig_media_id',
			'meta_value'     => (string) $media['id'],
		)
	);

	if ( $existing ) {
		return (int) $existing[0];
	}

	if ( ! up10_instagram_media_url_allowed( $media['media_url'] ) ) {
		return new WP_Error(
			'up10_instagram_media_url_invalid',
			__( 'La imagen de Instagram tiene una URL inválida.', 'up10-core' )
		);
	}

	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$attachment_id = media_sideload_image(
		$media['media_url'],
		0,
		sanitize_text_field( $media['caption'] ),
		'id'
	);

	if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
		return new WP_Error(
			'up10_instagram_sideload_failed',
			__( 'No se pudo guardar una imagen de Instagram. Se conserva la última caché.', 'up10-core' )
		);
	}

	update_post_meta( $attachment_id, '_up10_ig_media_id', (string) $media['id'] );
	update_post_meta( $attachment_id, '_up10_ig_permalink', esc_url_raw( $media['permalink'] ) );
	update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $media['caption'] ) );

	return (int) $attachment_id;
}

/**
 * Registra un error sin descartar los elementos de la caché anterior.
 *
 * @param WP_Error $error Error ocurrido.
 * @return WP_Error
 */
function up10_instagram_record_error( $error ) {
	$cache          = up10_instagram_cache();
	$cache['error'] = sanitize_key( $error->get_error_code() );
	update_option( 'up10_instagram_cache', $cache, false );

	return $error;
}

/**
 * Actualiza la caché, conservando el contenido anterior ante cualquier fallo.
 *
 * @param bool $force   Omite el límite de frecuencia.
 * @param bool $dry_run No descarga ni persiste cambios.
 * @return array|WP_Error
 */
function up10_instagram_sync( $force = false, $dry_run = false ) {
	if ( 'api' !== up10_instagram_mode() ) {
		return array(
			'status' => 'skipped',
			'items'  => 0,
		);
	}

	$cache = up10_instagram_cache();

	if ( ! $force && ! $dry_run && ! empty( $cache['synced_at'] ) ) {
		$synced_at = (int) get_option( 'up10_instagram_synced_at', 0 );

		if ( $synced_at && time() - $synced_at < 30 * MINUTE_IN_SECONDS ) {
			return array(
				'status' => 'fresh',
				'items'  => count( $cache['items'] ),
			);
		}
	}

	$media = up10_instagram_fetch_media();

	if ( is_wp_error( $media ) ) {
		return up10_instagram_record_error( $media );
	}

	if ( $dry_run ) {
		return array(
			'status' => 'dry-run',
			'items'  => count( $media ),
		);
	}

	$items = array();

	foreach ( $media as $item ) {
		$attachment_id = up10_instagram_sideload( $item );

		if ( is_wp_error( $attachment_id ) ) {
			return up10_instagram_record_error( $attachment_id );
		}

		$items[] = array(
			'id'            => $item['id'],
			'attachment_id' => $attachment_id,
			'caption'       => $item['caption'],
			'permalink'     => $item['permalink'],
			'type'          => $item['type'],
			'publishedAt'   => $item['publishedAt'],
		);
	}

	$synced_timestamp = time();
	$synced_at        = current_time( 'mysql' );

	update_option(
		'up10_instagram_cache',
		array(
			'items'     => $items,
			'synced_at' => $synced_at,
			'error'     => null,
		),
		false
	);
	update_option( 'up10_instagram_synced_at', $synced_timestamp, false );

	return array(
		'status' => 'synced',
		'items'  => count( $items ),
	);
}

/**
 * Renueva el token de larga duración.
 *
 * @return true|WP_Error
 */
function up10_instagram_refresh_token() {
	$response = up10_instagram_request(
		'refresh_access_token',
		array(
			'grant_type' => 'ig_refresh_token',
		)
	);

	if ( is_wp_error( $response ) ) {
		return up10_instagram_record_error( $response );
	}

	if ( empty( $response['access_token'] ) || ! is_string( $response['access_token'] ) ) {
		return up10_instagram_record_error(
			new WP_Error(
				'up10_instagram_refresh_invalid',
				__( 'Instagram no devolvió un token renovado válido.', 'up10-core' )
			)
		);
	}

	update_option( 'up10_instagram_token', $response['access_token'], false );
	update_option( 'up10_instagram_token_updated_at', time(), false );

	$cache          = up10_instagram_cache();
	$cache['error'] = null;
	update_option( 'up10_instagram_cache', $cache, false );

	return true;
}

/**
 * Añade los intervalos usados por la sincronización.
 *
 * @param array $schedules Intervalos existentes.
 * @return array
 */
function up10_instagram_cron_schedules( $schedules ) {
	$schedules['up10_30min'] = array(
		'interval' => 30 * MINUTE_IN_SECONDS,
		'display'  => __( 'Cada 30 minutos (UP10 Instagram)', 'up10-core' ),
	);
	$schedules['up10_monthly'] = array(
		'interval' => 30 * DAY_IN_SECONDS,
		'display'  => __( 'Cada 30 días (UP10 Instagram)', 'up10-core' ),
	);

	return $schedules;
}

/**
 * Programa los eventos si todavía no existen.
 */
function up10_instagram_schedule_events() {
	if ( ! wp_next_scheduled( 'up10_instagram_sync' ) ) {
		wp_schedule_event( time() + MINUTE_IN_SECONDS, 'up10_30min', 'up10_instagram_sync' );
	}

	if ( ! wp_next_scheduled( 'up10_instagram_refresh_token' ) ) {
		wp_schedule_event( time() + DAY_IN_SECONDS, 'up10_monthly', 'up10_instagram_refresh_token' );
	}
}

/**
 * Elimina los eventos programados al desactivar el plugin.
 */
function up10_instagram_clear_scheduled_events() {
	wp_clear_scheduled_hook( 'up10_instagram_sync' );
	wp_clear_scheduled_hook( 'up10_instagram_refresh_token' );
}

/**
 * Ejecuta la sincronización programada.
 */
function up10_instagram_run_scheduled_sync() {
	up10_instagram_sync();
}

/**
 * Ejecuta la renovación programada.
 */
function up10_instagram_run_scheduled_refresh() {
	if ( '' === up10_instagram_token() ) {
		return;
	}

	up10_instagram_refresh_token();
}

add_filter( 'cron_schedules', 'up10_instagram_cron_schedules' );
add_action( 'init', 'up10_instagram_schedule_events' );
add_action( 'up10_instagram_sync', 'up10_instagram_run_scheduled_sync' );
add_action( 'up10_instagram_refresh_token', 'up10_instagram_run_scheduled_refresh' );
