<?php
/**
 * Catálogo inicial de marcas y utilidades de importación.
 *
 * @package UP10_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Marcas iniciales. El slug se usa para no duplicar al reimportar.
 *
 * @return array<int, array<string, string|int>>
 */
function up10_brand_catalog() {
	return array(
		array(
			'slug'    => 'warner-music-group',
			'name'    => 'Warner Music Group',
			'file'    => 'warner-music-group.png',
			'order'   => 1,
			'website' => '',
		),
		array(
			'slug'    => 'sony-music',
			'name'    => 'Sony Music',
			'file'    => 'sony-music.png',
			'order'   => 2,
			'website' => '',
		),
		array(
			'slug'    => 'universal-music',
			'name'    => 'Universal Music',
			'file'    => 'universal.png',
			'order'   => 3,
			'website' => '',
		),
		array(
			'slug'    => 'rimas-publishing',
			'name'    => 'Rimas Publishing',
			'file'    => 'rimas-publishing.png',
			'order'   => 4,
			'website' => '',
		),
		array(
			'slug'    => 'lotus',
			'name'    => 'Lotus',
			'file'    => 'lotus.png',
			'order'   => 5,
			'website' => '',
		),
		array(
			'slug'    => 'iguana-producciones',
			'name'    => 'Iguana Producciones',
			'file'    => 'iguana-producciones.png',
			'order'   => 6,
			'website' => '',
		),
		array(
			'slug'    => 'bizarro-live-entertainment',
			'name'    => 'Bizarro Live Entertainment',
			'file'    => 'bizarro-live-entertainment.png',
			'order'   => 7,
			'website' => '',
		),
		array(
			'slug'    => 'lollapalooza-chile',
			'name'    => 'Lollapalooza Chile',
			'file'    => 'lollapalooza-chile.png',
			'order'   => 8,
			'website' => '',
		),
		array(
			'slug'    => 'la-junta',
			'name'    => 'La Junta',
			'file'    => 'la-junta.png',
			'order'   => 9,
			'website' => '',
		),
		array(
			'slug'    => 'casa-parlante',
			'name'    => 'Casa Parlante',
			'file'    => 'casa-parlante.png',
			'order'   => 10,
			'website' => '',
		),
		array(
			'slug'    => 'fenix-entertainment',
			'name'    => 'Fenix Entertainment',
			'file'    => 'fenix-entertainment.png',
			'order'   => 11,
			'website' => '',
		),
		array(
			'slug'    => 'premios-musa',
			'name'    => 'Premios Musa',
			'file'    => 'premios-musa.png',
			'order'   => 12,
			'website' => '',
		),
	);
}

/**
 * Directorio con los logos incluidos en el plugin.
 *
 * @return string
 */
function up10_brand_logo_dir() {
	return trailingslashit( UP10_CORE_PATH . 'assets/brands' );
}

/**
 * Busca el adjunto importado previamente para una marca.
 *
 * @param string $slug Slug de la marca.
 * @return int
 */
function up10_find_brand_attachment( $slug ) {
	$ids = get_posts(
		array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_key'       => '_up10_brand_logo_slug',
			'meta_value'     => $slug,
		)
	);

	return $ids ? (int) $ids[0] : 0;
}

/**
 * Importa un logo a la biblioteca de medios y lo marca como logo de marca.
 *
 * @param string $file Ruta absoluta del archivo.
 * @param string $name Nombre de la marca.
 * @param string $slug Slug de la marca.
 * @return int|WP_Error
 */
function up10_import_brand_logo( $file, $name, $slug ) {
	if ( ! function_exists( 'media_handle_sideload' ) ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
	}

	$tmp = wp_tempnam( basename( $file ) );

	if ( ! $tmp || ! copy( $file, $tmp ) ) {
		return new WP_Error( 'up10_brand_copy', __( 'No se pudo copiar el logo temporalmente.', 'up10-core' ) );
	}

	$attachment_id = media_handle_sideload(
		array(
			'name'     => basename( $file ),
			'tmp_name' => $tmp,
		),
		0
	);

	if ( is_wp_error( $attachment_id ) ) {
		@unlink( $tmp );
		return $attachment_id;
	}

	update_post_meta( $attachment_id, '_up10_brand_logo_slug', $slug );
	update_post_meta( $attachment_id, '_wp_attachment_image_alt', $name );

	wp_update_post(
		array(
			'ID'         => $attachment_id,
			'post_title' => $name,
		)
	);

	return (int) $attachment_id;
}
