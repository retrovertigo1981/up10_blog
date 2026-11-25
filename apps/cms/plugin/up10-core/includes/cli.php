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

	WP_CLI::add_command(
		'up10 marcas import',
		static function ( $args, $assoc_args ) {
			$dir   = isset( $assoc_args['dir'] ) ? (string) $assoc_args['dir'] : up10_brand_logo_dir();
			$dry   = isset( $assoc_args['dry-run'] );
			$force = isset( $assoc_args['force'] );
			$draft = isset( $assoc_args['draft'] );

			if ( ! is_dir( $dir ) ) {
				WP_CLI::error( sprintf( 'No existe el directorio de logos: %s', $dir ) );
				return;
			}

			$created = 0;
			$updated = 0;
			$logos   = 0;
			$skipped = 0;
			$failed  = 0;

			foreach ( up10_brand_catalog() as $brand ) {
				$slug  = sanitize_title( (string) $brand['slug'] );
				$name  = (string) $brand['name'];
				$file  = trailingslashit( $dir ) . (string) $brand['file'];
				$order = (int) $brand['order'];
				$site  = (string) $brand['website'];

				$existing = get_page_by_path( $slug, OBJECT, 'marca' );
				$post_id  = $existing ? (int) $existing->ID : 0;

				if ( $dry ) {
					WP_CLI::log(
						sprintf(
							'%s %s (%s) · logo: %s',
							$post_id ? '~' : '+',
							$name,
							$slug,
							is_readable( $file ) ? 'ok' : 'falta'
						)
					);
					continue;
				}

				if ( ! $post_id ) {
					$post_id = wp_insert_post(
						array(
							'post_type'   => 'marca',
							'post_title'  => $name,
							'post_name'   => $slug,
							'post_status' => $draft ? 'draft' : 'publish',
						),
						true
					);

					if ( is_wp_error( $post_id ) ) {
						$failed++;
						WP_CLI::warning( sprintf( '%s: %s', $name, $post_id->get_error_message() ) );
						continue;
					}

					$created++;
				} else {
					$updated++;
				}

				$current_logo = up10_image_id( up10_field( 'logo', $post_id, 0 ) );
				$attachment_id = 0;

				if ( $current_logo && ! $force && 'attachment' === get_post_type( $current_logo ) ) {
					$attachment_id = $current_logo;
					$skipped++;
				} else {
					$attachment_id = up10_find_brand_attachment( $slug );

					if ( ! $attachment_id || $force ) {
						if ( ! is_readable( $file ) ) {
							$failed++;
							WP_CLI::warning( sprintf( '%s: no se encontró %s', $name, $file ) );
							continue;
						}

						$imported = up10_import_brand_logo( $file, $name, $slug );

						if ( is_wp_error( $imported ) ) {
							$failed++;
							WP_CLI::warning( sprintf( '%s: %s', $name, $imported->get_error_message() ) );
							continue;
						}

						$attachment_id = (int) $imported;
						$logos++;
						WP_CLI::log( sprintf( '+ logo %s (#%d)', $name, $attachment_id ) );
					} else {
						$skipped++;
					}
				}

				if ( ! $attachment_id ) {
					$failed++;
					WP_CLI::warning( sprintf( '%s: sin logo asignado.', $name ) );
					continue;
				}

				if ( function_exists( 'update_field' ) ) {
					update_field( 'logo', $attachment_id, $post_id );

					if ( $force || '' === (string) get_post_meta( $post_id, 'website', true ) ) {
						update_field( 'website', $site, $post_id );
					}

					if ( $force || '' === (string) get_post_meta( $post_id, 'sort_order', true ) ) {
						update_field( 'sort_order', $order, $post_id );
					}
				} else {
					update_post_meta( $post_id, 'logo', $attachment_id );

					if ( $force || '' === (string) get_post_meta( $post_id, 'website', true ) ) {
						update_post_meta( $post_id, 'website', $site );
					}

					if ( $force || '' === (string) get_post_meta( $post_id, 'sort_order', true ) ) {
						update_post_meta( $post_id, 'sort_order', $order );
					}
				}

				set_post_thumbnail( $post_id, $attachment_id );

				if ( $force && $existing ) {
					wp_update_post(
						array(
							'ID'          => $post_id,
							'post_title'  => $name,
							'post_name'   => $slug,
							'post_status' => $draft ? 'draft' : 'publish',
						)
					);
				}
			}

			WP_CLI::success(
				sprintf(
					'Marcas: %d creadas, %d actualizadas, %d logos importados, %d logos omitidos, %d errores.',
					$created,
					$updated,
					$logos,
					$skipped,
					$failed
				)
			);
		},
		array(
			'shortdesc' => 'Importa las marcas iniciales y sus logos a la biblioteca de medios.',
			'synopsis'  => array(
				array(
					'type'        => 'assoc',
					'name'        => 'dir',
					'description' => 'Directorio con los PNG. Por defecto, assets/brands del plugin.',
					'optional'    => true,
				),
				array(
					'type'        => 'flag',
					'name'        => 'dry-run',
					'description' => 'Solo muestra lo que haría.',
					'optional'    => true,
				),
				array(
					'type'        => 'flag',
					'name'        => 'force',
					'description' => 'Actualiza título, orden, web y logo aunque ya existan.',
					'optional'    => true,
				),
				array(
					'type'        => 'flag',
					'name'        => 'draft',
					'description' => 'Crea las marcas como borrador.',
					'optional'    => true,
				),
			),
		)
	);
}
