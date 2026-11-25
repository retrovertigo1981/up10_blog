<?php
/**
 * API REST propia de UP10.
 *
 * @package UP10_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registra las rutas públicas de lectura.
 */
function up10_register_rest_routes() {
	register_rest_route(
		'up10/v1',
		'/ping',
		array(
			'methods'             => 'GET',
			'callback'            => 'up10_rest_ping',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'up10/v1',
		'/home',
		array(
			'methods'             => 'GET',
			'callback'            => 'up10_rest_home',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'up10/v1',
		'/posts',
		array(
			'methods'             => 'GET',
			'callback'            => 'up10_rest_posts',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'up10/v1',
		'/posts/(?P<slug>[a-z0-9-]+)',
		array(
			'methods'             => 'GET',
			'callback'            => 'up10_rest_post',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'up10/v1',
		'/categories',
		array(
			'methods'             => 'GET',
			'callback'            => 'up10_rest_categories',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'up10/v1',
		'/events',
		array(
			'methods'             => 'GET',
			'callback'            => 'up10_rest_events',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'up10/v1',
		'/events/(?P<slug>[a-z0-9-]+)',
		array(
			'methods'             => 'GET',
			'callback'            => 'up10_rest_event',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'up10/v1',
		'/top10',
		array(
			'methods'             => 'GET',
			'callback'            => 'up10_rest_top10',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'up10/v1',
		'/partners',
		array(
			'methods'             => 'GET',
			'callback'            => 'up10_rest_partners',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'up10/v1',
		'/pages/(?P<slug>[a-z0-9-]+)',
		array(
			'methods'             => 'GET',
			'callback'            => 'up10_rest_page',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'up10/v1',
		'/search',
		array(
			'methods'             => 'GET',
			'callback'            => 'up10_rest_search',
			'permission_callback' => '__return_true',
		)
	);
}

/**
 * Respuesta con cabeceras de caché.
 *
 * @param mixed $data   Datos.
 * @param int   $status Código HTTP.
 * @return WP_REST_Response
 */
function up10_rest_response( $data, $status = 200, $meta = null ) {
	$payload = array( 'data' => $data );

	if ( null !== $meta ) {
		$payload['meta'] = $meta;
	}

	$response = new WP_REST_Response( $payload, $status );
	$response->header( 'Cache-Control', 'public, max-age=60' );

	return $response;
}

/**
 * CORS para el frontend.
 *
 * @param bool             $served  Servido.
 * @param WP_HTTP_Response $result  Resultado.
 * @param WP_REST_Request  $request Request.
 * @param WP_REST_Server   $server  Server.
 * @return bool
 */
function up10_rest_cors_headers( $served, $result, $request, $server ) {
	unset( $result, $server );

	$origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_ORIGIN'] ) ) : '';
	$allowed = array(
		'https://up10.cl',
		'https://www.up10.cl',
		// Demo temporal del frontend estático en Vercel.
		'https://up10-blog.vercel.app',
	);

	$is_local = $origin && preg_match( '#^http://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin );

	if ( $origin && ( $is_local || in_array( $origin, $allowed, true ) ) ) {
		header( 'Access-Control-Allow-Origin: ' . $origin );
		header( 'Vary: Origin' );
		header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
		header( 'Access-Control-Allow-Headers: Content-Type, Authorization' );
	}

	return $served;
}
add_filter( 'rest_pre_serve_request', 'up10_rest_cors_headers', 10, 4 );

/**
 * Ping de salud.
 *
 * @return WP_REST_Response
 */
function up10_rest_ping() {
	return up10_rest_response(
		array(
			'ok'      => true,
			'plugin'  => 'up10-core',
			'version' => UP10_CORE_VERSION,
			'time'    => gmdate( 'c' ),
		)
	);
}

/**
 * Convierte una lista de WP_Post a PostSummary[].
 *
 * @param WP_Post[] $posts Posts.
 * @return array
 */
function up10_serialize_post_list( $posts ) {
	$data = array();

	foreach ( $posts as $post ) {
		$item = up10_serialize_post_summary( $post );
		if ( $item ) {
			$data[] = $item;
		}
	}

	return $data;
}

/**
 * Portada completa.
 *
 * @return WP_REST_Response
 */
function up10_rest_home() {
	$latest_posts = get_posts(
		array(
			'post_type'           => 'post',
			'post_status'         => 'publish',
			'posts_per_page'      => 10,
			'orderby'             => 'date',
			'order'               => 'DESC',
			'ignore_sticky_posts' => true,
			'no_found_rows'       => true,
		)
	);

	$breaking_posts = get_posts(
		array(
			'post_type'      => 'post',
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'no_found_rows'  => true,
			'tax_query'      => array(
				array(
					'taxonomy' => 'senal',
					'field'    => 'slug',
					'terms'    => 'ultima-hora',
				),
			),
		)
	);

	$breaking_post = $breaking_posts ? $breaking_posts[0] : null;
	$latest_ids = wp_list_pluck( $latest_posts, 'ID' );

	if ( $breaking_post && ! in_array( (int) $breaking_post->ID, array_map( 'intval', $latest_ids ), true ) ) {
		$latest_posts[] = $breaking_post;
		usort(
			$latest_posts,
			static function ( $a, $b ) {
				return strcmp( $b->post_date_gmt, $a->post_date_gmt );
			}
		);
		$latest_posts = array_slice( $latest_posts, 0, 10 );
	}

	$latest = up10_serialize_post_list( $latest_posts );

	$breaking = null;
	foreach ( $latest as $post ) {
		if ( ! empty( $post['isBreaking'] ) ) {
			$breaking = $post;
			break;
		}
	}

	$hero = $latest;
	if ( $breaking ) {
		$hero = array_values(
			array_filter(
				$latest,
				static function ( $post ) use ( $breaking ) {
					return (int) $post['id'] !== (int) $breaking['id'];
				}
			)
		);
		array_unshift( $hero, $breaking );
	}
	$hero = array_slice( $hero, 0, 3 );

	$interview_posts = get_posts(
		array(
			'post_type'      => 'post',
			'post_status'    => 'publish',
			'posts_per_page' => 3,
			'no_found_rows'  => true,
			'tax_query'      => array(
				array(
					'taxonomy' => 'tipo_contenido',
					'field'    => 'slug',
					'terms'    => 'entrevista',
				),
			),
		)
	);

	$events = get_posts(
		array(
			'post_type'      => 'evento',
			'post_status'    => 'publish',
			'posts_per_page' => 3,
			'no_found_rows'  => true,
			'meta_key'       => 'event_date',
			'orderby'        => 'meta_value',
			'order'          => 'ASC',
			'meta_query'     => array(
				array(
					'key'     => 'event_date',
					'value'   => current_time( 'Y-m-d' ),
					'compare' => '>=',
					'type'    => 'DATE',
				),
			),
		)
	);

	$top10_posts = get_posts(
		array(
			'post_type'      => 'track',
			'post_status'    => 'publish',
			'posts_per_page' => 10,
			'no_found_rows'  => true,
			'meta_key'       => 'position',
			'orderby'        => 'meta_value_num',
			'order'          => 'ASC',
		)
	);

	$partner_posts = up10_get_partner_posts();

	$stat_posts = get_posts(
		array(
			'post_type'      => 'stat',
			'post_status'    => 'publish',
			'posts_per_page' => 10,
			'no_found_rows'  => true,
			'meta_key'       => 'sort_order',
			'orderby'        => 'meta_value_num',
			'order'          => 'ASC',
		)
	);

	$unplugged = get_page_by_path( 'unplugged', OBJECT, 'page' );
	if ( $unplugged && 'publish' !== $unplugged->post_status ) {
		$unplugged = null;
	}
	$projects = array();

	foreach ( array( 'podcast', 'awards' ) as $slug ) {
		$page = get_page_by_path( $slug, OBJECT, 'page' );
		if ( $page && 'publish' === $page->post_status ) {
			$projects[] = up10_serialize_page( $page );
		}
	}

	return up10_rest_response(
		array(
			'hero'       => $hero,
			'latest'     => $latest,
			'interviews' => up10_serialize_post_list( $interview_posts ),
			'events'     => up10_serialize_events( $events ),
			'top10'      => up10_serialize_tracks( $top10_posts ),
			'instagram'  => up10_serialize_instagram(),
			'stats'      => array_values( array_map( 'up10_serialize_stat', $stat_posts ) ),
			'partners'   => array_values( array_map( 'up10_serialize_partner', $partner_posts ) ),
			'unplugged'  => $unplugged ? up10_serialize_page( $unplugged ) : null,
			'projects'   => $projects,
		)
	);
}

/**
 * Serializa las publicaciones de Instagram curadas.
 *
 * @return array
 */
function up10_serialize_instagram() {
	$rows = up10_field( 'instagram_posts', 'option', array() );

	if ( ! is_array( $rows ) ) {
		return array();
	}

	$items = array();

	foreach ( $rows as $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		$image_id = up10_image_id( $row['image'] ?? 0 );
		$image = $image_id ? up10_serialize_image( $image_id, $row['caption'] ?? '' ) : null;

		if ( ! $image ) {
			continue;
		}

		$items[] = array(
			'id'          => 'ig-' . $image_id,
			'image'       => $image,
			'caption'     => $row['caption'] ?? '',
			'permalink'   => $row['permalink'] ?? '',
			'type'        => $row['type'] ?? 'image',
			'publishedAt' => $row['published_at'] ?? '',
		);
	}

	return $items;
}

/**
 * Listado de artículos.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function up10_rest_posts( $request ) {
	$page = max( 1, (int) $request->get_param( 'page' ) );
	$per_page = min( 24, max( 1, (int) ( $request->get_param( 'perPage' ) ?: 12 ) ) );

	$args = array(
		'post_type'           => 'post',
		'post_status'         => 'publish',
		'paged'               => $page,
		'posts_per_page'      => $per_page,
		'ignore_sticky_posts' => true,
	);

	$tax_query = array();

	if ( $request->get_param( 'category' ) ) {
		$tax_query[] = array(
			'taxonomy' => 'category',
			'field'    => 'slug',
			'terms'    => sanitize_title( $request->get_param( 'category' ) ),
		);
	}

	if ( $request->get_param( 'tipo' ) ) {
		$tax_query[] = array(
			'taxonomy' => 'tipo_contenido',
			'field'    => 'slug',
			'terms'    => sanitize_title( $request->get_param( 'tipo' ) ),
		);
	}

	if ( $request->get_param( 'signal' ) ) {
		$tax_query[] = array(
			'taxonomy' => 'senal',
			'field'    => 'slug',
			'terms'    => sanitize_title( $request->get_param( 'signal' ) ),
		);
	}

	if ( $request->get_param( 'tag' ) ) {
		$tax_query[] = array(
			'taxonomy' => 'post_tag',
			'field'    => 'slug',
			'terms'    => sanitize_title( $request->get_param( 'tag' ) ),
		);
	}

	if ( ! empty( $tax_query ) ) {
		$tax_query['relation'] = 'AND';
		$args['tax_query'] = $tax_query;
	}

	$exclude = $request->get_param( 'exclude' );
	if ( $exclude ) {
		$exclude_ids = is_array( $exclude ) ? $exclude : explode( ',', (string) $exclude );
		$args['post__not_in'] = array_map( 'intval', $exclude_ids );
	}

	$order_by = $request->get_param( 'orderBy' );
	$args['orderby'] = in_array( $order_by, array( 'date', 'title' ), true ) ? $order_by : 'date';
	$args['order'] = 'asc' === strtolower( (string) $request->get_param( 'order' ) ) ? 'ASC' : 'DESC';

	$query = new WP_Query( $args );
	$data = up10_serialize_post_list( $query->posts );

	return up10_rest_response(
		$data,
		200,
		array(
			'pagination' => array(
				'page'       => $page,
				'perPage'    => $per_page,
				'total'      => (int) $query->found_posts,
				'totalPages' => (int) $query->max_num_pages,
			),
		)
	);
}

/**
 * Artículo por slug.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function up10_rest_post( $request ) {
	$slug = sanitize_title( $request->get_param( 'slug' ) );
	$post = get_page_by_path( $slug, OBJECT, 'post' );

	if ( ! $post || 'publish' !== $post->post_status ) {
		return new WP_REST_Response( array( 'error' => array( 'code' => 'not_found', 'message' => __( 'Artículo no encontrado.', 'up10-core' ) ) ), 404 );
	}

	$summary = up10_serialize_post_summary( $post );

	if ( ! $summary ) {
		return new WP_REST_Response( array( 'error' => array( 'code' => 'missing_cover', 'message' => __( 'El artículo no tiene imagen destacada.', 'up10-core' ) ) ), 500 );
	}

	$gallery = array();
	$gallery_ids = up10_field( 'gallery', $post->ID, array() );
	if ( is_array( $gallery_ids ) ) {
		foreach ( $gallery_ids as $image_id ) {
			$image = up10_serialize_image( up10_image_id( $image_id ), get_the_title( $post ) );
			if ( $image ) {
				$gallery[] = $image;
			}
		}
	}

	$related = array();
	$related_ids = up10_field( 'related', $post->ID, array() );
	if ( is_array( $related_ids ) && ! empty( $related_ids ) ) {
		foreach ( $related_ids as $related_id ) {
			$related_post = get_post( (int) $related_id );
			if ( $related_post && 'publish' === $related_post->post_status ) {
				$item = up10_serialize_post_summary( $related_post );
				if ( $item ) {
					$related[] = $item;
				}
			}
		}
	}

	if ( empty( $related ) ) {
		$categories = wp_get_post_categories( $post->ID );
		if ( ! empty( $categories ) ) {
			$fallback_posts = get_posts(
				array(
					'post_type'      => 'post',
					'post_status'    => 'publish',
					'posts_per_page' => 3,
					'post__not_in'   => array( $post->ID ),
					'category__in'   => $categories,
					'no_found_rows'  => true,
				)
			);

			foreach ( $fallback_posts as $fallback_post ) {
				$item = up10_serialize_post_summary( $fallback_post );
				if ( $item ) {
					$related[] = $item;
				}
			}
		}
	}

	$seo = up10_field( 'seo', $post->ID, array() );
	$video_url = up10_field( 'video_url', $post->ID, '' );
	$video = null;

	if ( $video_url && preg_match( '~(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)([A-Za-z0-9_-]{6,})~', $video_url, $matches ) ) {
		$video = array(
			'provider' => 'youtube',
			'id'       => $matches[1],
		);
	}

	$tags = wp_get_post_tags( $post->ID, array( 'fields' => 'names' ) );

	$seo_description = is_array( $seo ) && ! empty( $seo['seo_description'] ) ? $seo['seo_description'] : $summary['dek'];
	$seo_description = up10_trim_text( $seo_description, 160 );

	$og_image_id = is_array( $seo ) && ! empty( $seo['seo_og_image'] ) ? (int) $seo['seo_og_image'] : (int) get_post_thumbnail_id( $post );
	$og_image    = $og_image_id ? up10_serialize_og_image( $og_image_id, get_the_title( $post ) ) : $summary['cover'];

	$seo_data = array(
		'title'       => is_array( $seo ) && ! empty( $seo['seo_title'] ) ? $seo['seo_title'] : get_the_title( $post ),
		'description' => $seo_description,
		'ogImage'     => $og_image,
		'canonical'   => is_array( $seo ) && ! empty( $seo['seo_canonical'] ) ? $seo['seo_canonical'] : '',
		'noindex'     => is_array( $seo ) && ! empty( $seo['seo_noindex'] ),
	);

	return up10_rest_response(
		array_merge(
			$summary,
			array(
				'html'      => apply_filters( 'the_content', $post->post_content ),
				'gallery'   => $gallery,
				'video'     => $video,
				'tags'      => is_array( $tags ) ? $tags : array(),
				'related'   => $related,
				'seo'       => $seo_data,
				'updatedAt' => get_post_modified_time( 'c', true, $post ),
			)
		)
	);
}

/**
 * Categorías.
 *
 * @return WP_REST_Response
 */
function up10_rest_categories() {
	$terms = get_terms(
		array(
			'taxonomy'   => 'category',
			'hide_empty' => false,
		)
	);

	if ( is_wp_error( $terms ) ) {
		return up10_rest_response( array() );
	}

	$data = array_map(
		static function ( $term ) {
			return array(
				'id'    => (int) $term->term_id,
				'name'  => $term->name,
				'slug'  => $term->slug,
				'count' => (int) $term->count,
			);
		},
		$terms
	);

	return up10_rest_response( $data );
}

/**
 * Eventos.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function up10_rest_events( $request ) {
	$scope = $request->get_param( 'scope' ) ?: 'upcoming';
	$args = array(
		'post_type'      => 'evento',
		'post_status'    => 'publish',
		'posts_per_page' => 20,
		'no_found_rows'  => true,
		'meta_key'       => 'event_date',
		'orderby'        => 'meta_value',
		'order'          => 'ASC',
	);

	if ( 'past' === $scope ) {
		$args['order'] = 'DESC';
		$args['meta_query'] = array(
			array(
				'key'     => 'event_date',
				'value'   => current_time( 'Y-m-d' ),
				'compare' => '<',
				'type'    => 'DATE',
			),
		);
	} elseif ( 'upcoming' === $scope ) {
		$args['meta_query'] = array(
			array(
				'key'     => 'event_date',
				'value'   => current_time( 'Y-m-d' ),
				'compare' => '>=',
				'type'    => 'DATE',
			),
		);
	}

	$posts = get_posts( $args );

	return up10_rest_response( up10_serialize_events( $posts ) );
}

/**
 * Evento por slug.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function up10_rest_event( $request ) {
	$slug = sanitize_title( $request->get_param( 'slug' ) );
	$post = get_page_by_path( $slug, OBJECT, 'evento' );

	if ( ! $post || 'publish' !== $post->post_status ) {
		return new WP_REST_Response( array( 'error' => array( 'code' => 'not_found', 'message' => __( 'Evento no encontrado.', 'up10-core' ) ) ), 404 );
	}

	$event = up10_serialize_event( $post );
	$lineup = up10_field( 'lineup', $post->ID, array() );
	$seo = up10_field( 'seo', $post->ID, array() );

	$event['lineup'] = array();
	if ( is_array( $lineup ) ) {
		foreach ( $lineup as $artist ) {
			if ( ! is_array( $artist ) || empty( $artist['name'] ) ) {
				continue;
			}
			$event['lineup'][] = array(
				'name' => $artist['name'],
				'url'  => $artist['url'] ?? '',
			);
		}
	}

	$event['descriptionHtml'] = apply_filters( 'the_content', $post->post_content );
	$event['seo'] = array(
		'title'       => is_array( $seo ) && ! empty( $seo['seo_title'] ) ? $seo['seo_title'] : get_the_title( $post ),
		'description' => is_array( $seo ) && ! empty( $seo['seo_description'] ) ? $seo['seo_description'] : '',
		'noindex'     => is_array( $seo ) && ! empty( $seo['seo_noindex'] ),
	);

	return up10_rest_response( $event );
}

/**
 * TOP 10.
 *
 * @return WP_REST_Response
 */
function up10_rest_top10() {
	$posts = get_posts(
		array(
			'post_type'      => 'track',
			'post_status'    => 'publish',
			'posts_per_page' => 10,
			'no_found_rows'  => true,
			'meta_key'       => 'position',
			'orderby'        => 'meta_value_num',
			'order'          => 'ASC',
		)
	);

	return up10_rest_response(
		up10_serialize_tracks( $posts ),
		200,
		array(
			'playlistUrl' => (string) up10_field( 'top10_playlist_url', 'option', '' ),
			'syncedAt'    => (string) get_option( 'up10_top10_synced_at', '' ),
		)
	);
}

/**
 * Marcas publicadas, ordenadas por el campo Orden.
 *
 * Se ordena en PHP para que una marca sin orden asignado no desaparezca de la
 * consulta y quede al final. Así el cliente puede agregar marcas desde el admin
 * sin tocar código.
 *
 * @return WP_Post[]
 */
function up10_get_partner_posts() {
	$posts = get_posts(
		array(
			'post_type'      => 'marca',
			'post_status'    => 'publish',
			'posts_per_page' => (int) apply_filters( 'up10_partners_limit', 50 ),
			'no_found_rows'  => true,
			'orderby'        => 'title',
			'order'          => 'ASC',
		)
	);

	usort(
		$posts,
		static function ( $a, $b ) {
			$order_a = get_post_meta( $a->ID, 'sort_order', true );
			$order_b = get_post_meta( $b->ID, 'sort_order', true );
			$order_a = '' === $order_a ? PHP_INT_MAX : (int) $order_a;
			$order_b = '' === $order_b ? PHP_INT_MAX : (int) $order_b;

			if ( $order_a === $order_b ) {
				return strcasecmp( $a->post_title, $b->post_title );
			}

			return $order_a <=> $order_b;
		}
	);

	return $posts;
}

/**
 * Marcas.
 *
 * @return WP_REST_Response
 */
function up10_rest_partners() {
	$posts = up10_get_partner_posts();

	return up10_rest_response( array_values( array_map( 'up10_serialize_partner', $posts ) ) );
}

/**
 * Página por slug.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function up10_rest_page( $request ) {
	$slug = sanitize_title( $request->get_param( 'slug' ) );
	$page = get_page_by_path( $slug, OBJECT, 'page' );

	if ( ! $page || 'publish' !== $page->post_status ) {
		return new WP_REST_Response( array( 'error' => array( 'code' => 'not_found', 'message' => __( 'Página no encontrada.', 'up10-core' ) ) ), 404 );
	}

	return up10_rest_response( up10_serialize_page( $page ) );
}

/**
 * Buscador.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function up10_rest_search( $request ) {
	$term = sanitize_text_field( (string) $request->get_param( 'q' ) );
	$per_page = min( 24, max( 1, (int) ( $request->get_param( 'perPage' ) ?: 10 ) ) );

	if ( '' === $term ) {
		return up10_rest_response( array() );
	}

	$query = new WP_Query(
		array(
			'post_type'      => 'post',
			'post_status'    => 'publish',
			's'              => $term,
			'posts_per_page' => $per_page,
			'no_found_rows'  => true,
		)
	);

	return up10_rest_response( up10_serialize_post_list( $query->posts ) );
}
