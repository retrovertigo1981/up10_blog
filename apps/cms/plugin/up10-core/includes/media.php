<?php
/**
 * Tamaños de imagen, generación WebP y serialización de medios.
 *
 * @package UP10_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Tamaños que usa el frontend.
 */
function up10_setup_image_sizes() {
	// El CMS necesita imágenes destacadas incluso si se activa otro tema.
	add_theme_support( 'post-thumbnails' );

	add_image_size( 'up10-cover', 1600, 1067, true );
	add_image_size( 'up10-card', 800, 450, true );
	add_image_size( 'up10-square', 800, 800, true );
	add_image_size( 'up10-thumb', 400, 400, true );
}

/**
 * Limita el original que WordPress conserva para las imágenes nuevas.
 *
 * @return int
 */
function up10_big_image_size_threshold() {
	return 2000;
}
add_filter( 'big_image_size_threshold', 'up10_big_image_size_threshold' );

/**
 * Normaliza un valor de campo imagen a un ID de adjunto.
 *
 * @param mixed $value Valor de SCF.
 * @return int
 */
function up10_image_id( $value ) {
	if ( is_numeric( $value ) ) {
		return (int) $value;
	}

	if ( is_array( $value ) && isset( $value['ID'] ) ) {
		return (int) $value['ID'];
	}

	if ( is_array( $value ) && isset( $value['id'] ) ) {
		return (int) $value['id'];
	}

	return 0;
}

/**
 * Comprueba si el editor de imágenes del servidor soporta WebP.
 *
 * @return bool
 */
function up10_webp_supported() {
	return wp_image_editor_supports( array( 'mime_type' => 'image/webp' ) );
}

/**
 * Convierte una ruta absoluta de uploads a ruta relativa.
 *
 * @param string $absolute_path Ruta absoluta.
 * @return string
 */
function up10_relative_upload_path( $absolute_path ) {
	$uploads = wp_get_upload_dir();

	if ( ! empty( $uploads['error'] ) ) {
		return '';
	}

	$basedir = trailingslashit( $uploads['basedir'] );

	if ( 0 !== strpos( $absolute_path, $basedir ) ) {
		return '';
	}

	return ltrim( substr( $absolute_path, strlen( $basedir ) ), '/' );
}

/**
 * Genera un archivo WebP a partir de una imagen.
 *
 * @param string $source_path Ruta de origen.
 * @param string $target_path Ruta de destino.
 * @param int    $quality     Calidad.
 * @return array|WP_Error
 */
function up10_create_webp_file( $source_path, $target_path, $quality = 82 ) {
	if ( ! up10_webp_supported() ) {
		return new WP_Error( 'up10_webp_unsupported', __( 'El servidor no soporta WebP.', 'up10-core' ) );
	}

	if ( ! file_exists( $source_path ) ) {
		return new WP_Error( 'up10_webp_missing', __( 'No existe la imagen de origen.', 'up10-core' ) );
	}

	$editor = wp_get_image_editor( $source_path );

	if ( is_wp_error( $editor ) ) {
		return $editor;
	}

	$editor->set_quality( $quality );
	$saved = $editor->save( $target_path, 'image/webp' );

	if ( is_wp_error( $saved ) ) {
		return $saved;
	}

	return $saved;
}

/**
 * Genera las versiones WebP de un adjunto.
 *
 * @param int        $attachment_id ID del adjunto.
 * @param array|null $metadata      Metadatos ya generados por WordPress.
 * @return array|WP_Error
 */
function up10_generate_webp_for_attachment( $attachment_id, $metadata = null ) {
	$attachment_id = (int) $attachment_id;

	if ( $attachment_id <= 0 ) {
		return new WP_Error( 'up10_webp_invalid', __( 'Adjunto inválido.', 'up10-core' ) );
	}

	$mime = get_post_mime_type( $attachment_id );

	if ( ! in_array( $mime, array( 'image/jpeg', 'image/png' ), true ) ) {
		return true;
	}

	if ( ! up10_webp_supported() ) {
		return new WP_Error( 'up10_webp_unsupported', __( 'El servidor no soporta WebP.', 'up10-core' ) );
	}

	if ( null === $metadata ) {
		$metadata = wp_get_attachment_metadata( $attachment_id );
	}

	if ( ! is_array( $metadata ) || empty( $metadata['file'] ) ) {
		return new WP_Error( 'up10_webp_metadata', __( 'El adjunto no tiene metadatos de imagen.', 'up10-core' ) );
	}

	$full_path = get_attached_file( $attachment_id );

	if ( ! $full_path || ! file_exists( $full_path ) ) {
		return new WP_Error( 'up10_webp_file', __( 'No se encontró el archivo original.', 'up10-core' ) );
	}

	$uploads = wp_get_upload_dir();
	$basedir = trailingslashit( $uploads['basedir'] );
	$map     = array(
		'full'  => array(),
		'sizes' => array(),
	);

	$full_target = preg_replace( '/\.[^.]+$/', '.webp', $full_path );
	$full_saved  = up10_create_webp_file( $full_path, $full_target );

	if ( ! is_wp_error( $full_saved ) ) {
		$map['full'] = array(
			'file'   => up10_relative_upload_path( $full_saved['path'] ),
			'width'  => (int) $full_saved['width'],
			'height' => (int) $full_saved['height'],
		);
	}

	$directory = dirname( $metadata['file'] );
	$sizes     = isset( $metadata['sizes'] ) && is_array( $metadata['sizes'] ) ? $metadata['sizes'] : array();

	foreach ( $sizes as $name => $size ) {
		if ( empty( $size['file'] ) ) {
			continue;
		}

		$source_relative = $directory . '/' . $size['file'];
		$source_path     = $basedir . $source_relative;

		if ( ! file_exists( $source_path ) ) {
			continue;
		}

		$target_path = preg_replace( '/\.[^.]+$/', '.webp', $source_path );
		$saved       = up10_create_webp_file( $source_path, $target_path );

		if ( is_wp_error( $saved ) ) {
			continue;
		}

		$map['sizes'][ $name ] = array(
			'file'   => up10_relative_upload_path( $saved['path'] ),
			'width'  => (int) $saved['width'],
			'height' => (int) $saved['height'],
		);
	}

	if ( ! empty( $map['full'] ) || ! empty( $map['sizes'] ) ) {
		update_post_meta( $attachment_id, '_up10_webp', $map );
	}

	return $map;
}

/**
 * Genera una imagen OG JPEG 1200×630 para un adjunto.
 *
 * @param int  $attachment_id ID del adjunto.
 * @param bool $force         Regenerar aunque exista.
 * @return array|WP_Error
 */
function up10_generate_og_for_attachment( $attachment_id, $force = false ) {
	$attachment_id = (int) $attachment_id;

	if ( $attachment_id <= 0 ) {
		return new WP_Error( 'up10_og_invalid', __( 'Adjunto inválido.', 'up10-core' ) );
	}

	$existing = get_post_meta( $attachment_id, '_up10_og', true );

	if ( ! $force && is_array( $existing ) && ! empty( $existing['file'] ) ) {
		return $existing;
	}

	$full_path = get_attached_file( $attachment_id );

	if ( ! $full_path || ! file_exists( $full_path ) ) {
		return new WP_Error( 'up10_og_file', __( 'No se encontró el archivo original.', 'up10-core' ) );
	}

	$editor = wp_get_image_editor( $full_path );

	if ( is_wp_error( $editor ) ) {
		return $editor;
	}

	$target_path = dirname( $full_path ) . '/' . pathinfo( $full_path, PATHINFO_FILENAME ) . '-og.jpg';

	$editor->resize( 1200, 630, true );
	$editor->set_quality( 82 );
	$saved = $editor->save( $target_path, 'image/jpeg' );

	if ( is_wp_error( $saved ) ) {
		return $saved;
	}

	$map = array(
		'file'   => up10_relative_upload_path( $saved['path'] ),
		'width'  => (int) $saved['width'],
		'height' => (int) $saved['height'],
		'mime'   => 'image/jpeg',
	);

	update_post_meta( $attachment_id, '_up10_og', $map );

	return $map;
}

/**
 * Genera WebP automáticamente después de subir una imagen.
 *
 * @param array $metadata      Metadatos.
 * @param int   $attachment_id ID del adjunto.
 * @return array
 */
function up10_generate_image_assets_on_upload( $metadata, $attachment_id ) {
	$result = up10_generate_webp_for_attachment( $attachment_id, $metadata );

	if ( is_wp_error( $result ) && defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		error_log( 'UP10 WebP: ' . $result->get_error_message() );
	}

	return $metadata;
}
add_filter( 'wp_generate_attachment_metadata', 'up10_generate_image_assets_on_upload', 20, 2 );

/**
 * Devuelve las URLs WebP de un adjunto para el contrato del frontend.
 *
 * @param int $attachment_id ID del adjunto.
 * @return array|null
 */
function up10_get_webp_image( $attachment_id ) {
	$map = get_post_meta( $attachment_id, '_up10_webp', true );

	if ( ! is_array( $map ) || empty( $map['full']['file'] ) ) {
		return null;
	}

	$uploads = wp_get_upload_dir();

	if ( ! empty( $uploads['error'] ) ) {
		return null;
	}

	$baseurl = trailingslashit( $uploads['baseurl'] );
	$entries = array();

	if ( ! empty( $map['full']['width'] ) ) {
		$width               = (int) $map['full']['width'];
		$entries[ $width ] = $baseurl . $map['full']['file'] . ' ' . $width . 'w';
	}

	foreach ( $map['sizes'] as $size ) {
		if ( empty( $size['file'] ) || empty( $size['width'] ) ) {
			continue;
		}

		$width             = (int) $size['width'];
		$entries[ $width ] = $baseurl . $size['file'] . ' ' . $width . 'w';
	}

	ksort( $entries );

	return array(
		'src'    => $baseurl . $map['full']['file'],
		'srcset' => implode( ', ', $entries ),
	);
}

/**
 * Devuelve una imagen OG JPEG o cae al original.
 *
 * @param int    $attachment_id ID del adjunto.
 * @param string $fallback_alt  Texto alternativo.
 * @return array|null
 */
function up10_serialize_og_image( $attachment_id, $fallback_alt = '' ) {
	$attachment_id = (int) $attachment_id;

	if ( $attachment_id <= 0 ) {
		return null;
	}

	$og = get_post_meta( $attachment_id, '_up10_og', true );

	if ( ! is_array( $og ) || empty( $og['file'] ) ) {
		$generated = up10_generate_og_for_attachment( $attachment_id );

		if ( ! is_wp_error( $generated ) ) {
			$og = $generated;
		}
	}

	if ( is_array( $og ) && ! empty( $og['file'] ) ) {
		$uploads = wp_get_upload_dir();

		return array(
			'src'        => trailingslashit( $uploads['baseurl'] ) . $og['file'],
			'width'      => (int) $og['width'],
			'height'     => (int) $og['height'],
			'alt'        => $fallback_alt,
			'srcset'     => '',
			'focalPoint' => 'center',
			'mimeType'   => 'image/jpeg',
		);
	}

	return up10_serialize_image( $attachment_id, $fallback_alt );
}

/**
 * Serializa un adjunto al contrato Image del frontend.
 *
 * @param int    $attachment_id ID del adjunto.
 * @param string $fallback_alt  Texto alternativo de respaldo.
 * @param string $focal_point    Punto focal.
 * @return array|null
 */
function up10_serialize_image( $attachment_id, $fallback_alt = '', $focal_point = 'center' ) {
	$attachment_id = (int) $attachment_id;

	if ( $attachment_id <= 0 ) {
		return null;
	}

	$src = wp_get_attachment_image_src( $attachment_id, 'full' );

	if ( ! is_array( $src ) ) {
		return null;
	}

	$alt      = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );
	$srcset   = wp_get_attachment_image_srcset( $attachment_id, 'full' );
	$mime     = get_post_mime_type( $attachment_id );
	$webp     = up10_get_webp_image( $attachment_id );
	$data     = array(
		'src'        => $src[0],
		'width'      => (int) $src[1],
		'height'     => (int) $src[2],
		'alt'        => $alt ? $alt : $fallback_alt,
		'srcset'     => $srcset ? $srcset : '',
		'focalPoint' => $focal_point ? $focal_point : 'center',
		'mimeType'   => $mime ? $mime : '',
	);

	if ( $webp ) {
		$data['webp'] = $webp;
	}

	return $data;
}
