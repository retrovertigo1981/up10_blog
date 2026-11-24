<?php
/**
 * Tamaños de imagen y serialización de medios.
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

	$alt = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );
	$srcset = wp_get_attachment_image_srcset( $attachment_id, 'full' );

	return array(
		'src'        => $src[0],
		'width'      => (int) $src[1],
		'height'     => (int) $src[2],
		'alt'        => $alt ? $alt : $fallback_alt,
		'srcset'     => $srcset ? $srcset : '',
		'focalPoint' => $focal_point ? $focal_point : 'center',
	);
}
