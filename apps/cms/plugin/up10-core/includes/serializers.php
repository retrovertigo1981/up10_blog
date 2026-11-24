<?php
/**
 * WP → contrato camelCase del frontend.
 *
 * @package UP10_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lee un campo SCF con respaldo si el plugin no está activo.
 *
 * @param string $name    Nombre del campo.
 * @param int    $post_id ID del post.
 * @param mixed  $default Valor por defecto.
 * @return mixed
 */
function up10_field( $name, $post_id, $default = '' ) {
	if ( function_exists( 'get_field' ) ) {
		$value = get_field( $name, $post_id );
		return ( null === $value || '' === $value ) ? $default : $value;
	}

	$value = get_post_meta( $post_id, $name, true );
	return ( '' === $value ) ? $default : $value;
}

/**
 * Lee un campo booleano conservando el valor false.
 *
 * @param string $name    Nombre del campo.
 * @param int    $post_id ID del post u 'option'.
 * @param bool   $default Valor por defecto.
 * @return bool
 */
function up10_bool_field( $name, $post_id, $default = false ) {
	if ( function_exists( 'get_field' ) ) {
		$value = get_field( $name, $post_id );
		if ( null === $value || '' === $value ) {
			return $default;
		}
		return (bool) $value;
	}

	$value = get_post_meta( $post_id, $name, true );
	if ( '' === $value ) {
		return $default;
	}
	return (bool) $value;
}

/**
 * Serializa un autor.
 *
 * @param WP_Post $post Post.
 * @return array
 */
function up10_serialize_author( $post ) {
	$user = get_userdata( (int) $post->post_author );

	if ( ! $user ) {
		return array(
			'id'   => 0,
			'name' => __( 'Redacción UP10', 'up10-core' ),
			'slug' => 'redaccion',
		);
	}

	$avatar_url = get_avatar_url( $user->ID, array( 'size' => 96 ) );

	return array(
		'id'     => (int) $user->ID,
		'name'   => $user->display_name,
		'slug'   => $user->user_nicename,
		'bio'    => $user->description ? $user->description : null,
		'avatar' => $avatar_url ? array(
			'src'        => $avatar_url,
			'width'      => 96,
			'height'     => 96,
			'alt'        => $user->display_name,
			'srcset'     => '',
			'focalPoint' => 'center',
		) : null,
	);
}

/**
 * Serializa la categoría principal.
 *
 * @param WP_Post $post Post.
 * @return array
 */
function up10_serialize_category( $post ) {
	$categories = get_the_category( (int) $post->ID );

	if ( empty( $categories ) ) {
		return array(
			'id'   => 0,
			'name' => __( 'Sin categoría', 'up10-core' ),
			'slug' => 'sin-categoria',
		);
	}

	$category = $categories[0];

	return array(
		'id'    => (int) $category->term_id,
		'name'  => $category->name,
		'slug'  => $category->slug,
		'count' => (int) $category->count,
	);
}

/**
 * Serializa las señales editoriales.
 *
 * @param WP_Post $post Post.
 * @return array
 */
function up10_serialize_signals( $post ) {
	$terms = wp_get_post_terms( (int) $post->ID, 'senal', array( 'fields' => 'all' ) );

	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return array();
	}

	return array_map(
		static function ( $term ) {
			return array(
				'id'   => (int) $term->term_id,
				'name' => $term->name,
				'slug' => $term->slug,
			);
		},
		$terms
	);
}

/**
 * Serializa un PostSummary.
 *
 * @param WP_Post $post Post.
 * @return array|null
 */
function up10_serialize_post_summary( $post ) {
	$cover_id = (int) get_post_thumbnail_id( $post );

	if ( $cover_id <= 0 ) {
		return null;
	}

	$focal_point = up10_field( 'focal_point', $post->ID, 'center' );
	$cover = up10_serialize_image( $cover_id, get_the_title( $post ), $focal_point );

	if ( ! $cover ) {
		return null;
	}

	$dek = up10_field( 'dek', $post->ID, '' );
	if ( ! $dek ) {
		$dek = get_the_excerpt( $post );
	}

	$reading_time = (int) up10_field( 'reading_time', $post->ID, 0 );
	if ( $reading_time <= 0 ) {
		$words = str_word_count( wp_strip_all_tags( $post->post_content ) );
		$reading_time = max( 1, (int) ceil( $words / 200 ) );
	}

	$terms = wp_get_post_terms( (int) $post->ID, 'tipo_contenido', array( 'fields' => 'slugs' ) );
	$tipo = ( ! is_wp_error( $terms ) && ! empty( $terms ) ) ? $terms[0] : 'noticia';

	$signals = up10_serialize_signals( $post );
	$is_breaking = false;
	foreach ( $signals as $signal ) {
		if ( 'ultima-hora' === $signal['slug'] ) {
			$is_breaking = true;
			break;
		}
	}

	return array(
		'id'          => (int) $post->ID,
		'slug'        => $post->post_name,
		'title'       => get_the_title( $post ),
		'dek'         => $dek ? wp_strip_all_tags( $dek ) : '',
		'cover'       => $cover,
		'category'    => up10_serialize_category( $post ),
		'tipo'        => $tipo,
		'author'      => up10_serialize_author( $post ),
		'publishedAt' => get_post_time( 'c', true, $post ),
		'readingTime' => $reading_time,
		'isFeatured'  => up10_bool_field( 'is_featured', $post->ID, false ),
		'signals'     => $signals,
		'isBreaking'  => $is_breaking,
	);
}

/**
 * Serializa una cifra.
 *
 * @param WP_Post $post Post.
 * @return array
 */
function up10_serialize_stat( $post ) {
	$animated = up10_bool_field( 'animated', $post->ID, true );

	return array(
		'id'         => (int) $post->ID,
		'label'      => up10_field( 'label', $post->ID, get_the_title( $post ) ),
		'shortLabel' => up10_field( 'short_label', $post->ID, '' ),
		'value'      => (float) up10_field( 'value', $post->ID, 0 ),
		'prefix'     => up10_field( 'prefix', $post->ID, '' ),
		'suffix'     => up10_field( 'suffix', $post->ID, '' ),
		'format'     => up10_field( 'format', $post->ID, 'number' ),
		'animated'   => (bool) $animated,
	);
}

/**
 * Serializa un evento.
 *
 * @param WP_Post $post Post.
 * @return array
 */
function up10_serialize_event( $post ) {
	$date = up10_field( 'event_date', $post->ID, '' );
	$time = up10_field( 'event_time', $post->ID, '00:00' );
	$image_id = (int) get_post_thumbnail_id( $post );

	$iso = $date;
	if ( $date ) {
		try {
			$datetime = new DateTimeImmutable( $date . ' ' . $time, wp_timezone() );
			$iso = $datetime->setTimezone( new DateTimeZone( 'UTC' ) )->format( 'Y-m-d\TH:i:s\Z' );
		} catch ( Exception $e ) {
			$iso = $date;
		}
	}

	$status = 'upcoming';
	if ( $date && $date < current_time( 'Y-m-d' ) ) {
		$status = 'past';
	}

	return array(
		'id'        => (int) $post->ID,
		'slug'      => $post->post_name,
		'title'     => get_the_title( $post ),
		'date'      => $iso,
		'time'      => $time,
		'venue'     => up10_field( 'venue', $post->ID, '' ),
		'city'      => up10_field( 'city', $post->ID, '' ),
		'image'     => up10_serialize_image( $image_id, get_the_title( $post ) ),
		'ticketUrl' => up10_field( 'ticket_url', $post->ID, '' ),
		'status'    => $status,
	);
}

/**
 * Serializa un track del TOP 10.
 *
 * @param WP_Post $post Post.
 * @return array
 */
function up10_serialize_track( $post ) {
	$previous = up10_field( 'previous_position', $post->ID, null );
	$movement = up10_field( 'movement', $post->ID, 'same' );
	$cover_id = (int) get_post_thumbnail_id( $post );

	return array(
		'position'         => (int) up10_field( 'position', $post->ID, 0 ),
		'previousPosition' => ( '' === $previous || null === $previous ) ? null : (int) $previous,
		'movement'         => $movement,
		'isNew'            => up10_bool_field( 'is_new', $post->ID, false ),
		'title'            => get_the_title( $post ),
		'artist'           => up10_field( 'artist', $post->ID, '' ),
		'cover'            => up10_serialize_image( $cover_id, get_the_title( $post ) ),
		'spotifyUrl'       => up10_field( 'spotify_url', $post->ID, '' ),
		'source'           => up10_field( 'source', $post->ID, 'manual' ),
	);
}

/**
 * Serializa una lista de eventos omitiendo los que no tienen imagen.
 *
 * @param WP_Post[] $posts Posts.
 * @return array
 */
function up10_serialize_events( $posts ) {
	$data = array();

	foreach ( $posts as $post ) {
		$event = up10_serialize_event( $post );
		if ( ! empty( $event['image'] ) ) {
			$data[] = $event;
		}
	}

	return $data;
}

/**
 * Serializa una lista de tracks omitiendo los que no tienen portada.
 *
 * @param WP_Post[] $posts Posts.
 * @return array
 */
function up10_serialize_tracks( $posts ) {
	$data = array();

	foreach ( $posts as $post ) {
		$track = up10_serialize_track( $post );
		if ( ! empty( $track['cover'] ) ) {
			$data[] = $track;
		}
	}

	return $data;
}

/**
 * Serializa una marca.
 *
 * @param WP_Post $post Post.
 * @return array
 */
function up10_serialize_partner( $post ) {
	$logo_id = up10_image_id( up10_field( 'logo', $post->ID, 0 ) );

	return array(
		'id'   => (int) $post->ID,
		'name' => get_the_title( $post ),
		'logo' => $logo_id ? up10_serialize_image( $logo_id, get_the_title( $post ) ) : null,
		'url'  => up10_field( 'website', $post->ID, '' ),
	);
}

/**
 * Serializa una página institucional.
 *
 * @param WP_Post $post Post.
 * @return array
 */
function up10_serialize_page( $post ) {
	$hero = up10_field( 'hero', $post->ID, array() );
	$seo  = up10_field( 'seo', $post->ID, array() );
	$hero_image_id = is_array( $hero ) && isset( $hero['image'] ) ? up10_image_id( $hero['image'] ) : 0;

	return array(
		'slug'  => $post->post_name,
		'title' => get_the_title( $post ),
		'hero'  => array(
			'title'    => is_array( $hero ) && ! empty( $hero['title'] ) ? $hero['title'] : get_the_title( $post ),
			'subtitle' => is_array( $hero ) && ! empty( $hero['subtitle'] ) ? $hero['subtitle'] : '',
			'image'    => $hero_image_id ? up10_serialize_image( $hero_image_id, get_the_title( $post ) ) : null,
		),
		'html'  => apply_filters( 'the_content', $post->post_content ),
		'seo'   => array(
			'title'       => is_array( $seo ) && ! empty( $seo['seo_title'] ) ? $seo['seo_title'] : get_the_title( $post ),
			'description' => is_array( $seo ) && ! empty( $seo['seo_description'] ) ? $seo['seo_description'] : '',
			'noindex'     => is_array( $seo ) && ! empty( $seo['seo_noindex'] ),
		),
	);
}
