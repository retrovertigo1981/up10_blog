<?php
/**
 * Comandos WP-CLI de mantenimiento de medios.
 *
 * @package UP10_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	WP_CLI::add_command(
		'up10 webp',
		static function ( $args, $assoc_args ) {
			if ( ! up10_webp_supported() ) {
				WP_CLI::error( 'El servidor no soporta WebP en GD/Imagick. No se generaron archivos.' );
				return;
			}

			$limit  = isset( $assoc_args['limit'] ) ? (int) $assoc_args['limit'] : 50;
			$offset = isset( $assoc_args['offset'] ) ? (int) $assoc_args['offset'] : 0;
			$force  = isset( $assoc_args['force'] );
			$dry    = isset( $assoc_args['dry-run'] );

			$query = new WP_Query(
				array(
					'post_type'      => 'attachment',
					'post_status'    => 'inherit',
					'post_mime_type' => array( 'image/jpeg', 'image/png' ),
					'posts_per_page' => $limit > 0 ? $limit : -1,
					'offset'         => max( 0, $offset ),
					'fields'         => 'ids',
					'orderby'        => 'ID',
					'order'          => 'ASC',
				)
			);

			if ( empty( $query->posts ) ) {
				WP_CLI::warning( 'No hay imágenes JPEG/PNG para procesar en este lote.' );
				return;
			}

			$converted = 0;
			$skipped   = 0;
			$failed    = 0;

			foreach ( $query->posts as $attachment_id ) {
				if ( ! $force ) {
					$webp = get_post_meta( $attachment_id, '_up10_webp', true );

					if ( is_array( $webp ) && ! empty( $webp['full']['file'] ) ) {
						$skipped++;
						WP_CLI::log( "= {$attachment_id} ya tiene WebP" );
						continue;
					}
				}

				if ( $dry ) {
					WP_CLI::log( "~ {$attachment_id} se convertiría" );
					continue;
				}

				$result = up10_generate_webp_for_attachment( $attachment_id );

				if ( is_wp_error( $result ) ) {
					$failed++;
					WP_CLI::warning( "{$attachment_id}: " . $result->get_error_message() );
					continue;
				}

				$converted++;
				WP_CLI::log( "+ {$attachment_id} WebP generado" );
			}

			WP_CLI::success(
				sprintf(
					'Lote terminado: %d convertidas, %d omitidas, %d con error.',
					$converted,
					$skipped,
					$failed
				)
			);
		}
	);
}
