<?php
/**
 * Taxonomías, tipos de contenido y términos iniciales.
 *
 * @package UP10_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registra las taxonomías editoriales.
 */
function up10_register_taxonomies() {
	register_taxonomy(
		'tipo_contenido',
		array( 'post' ),
		array(
			'labels'            => array(
				'name'          => __( 'Tipos de contenido', 'up10-core' ),
				'singular_name' => __( 'Tipo de contenido', 'up10-core' ),
				'menu_name'     => __( 'Tipos de contenido', 'up10-core' ),
			),
			'public'            => false,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'show_in_quick_edit' => false,
			'hierarchical'      => false,
			'meta_box_cb'       => 'up10_tipo_contenido_meta_box',
			'rewrite'           => false,
		)
	);

	register_taxonomy(
		'senal',
		array( 'post' ),
		array(
			'labels'            => array(
				'name'          => __( 'Señales editoriales', 'up10-core' ),
				'singular_name' => __( 'Señal editorial', 'up10-core' ),
				'menu_name'     => __( 'Señales editoriales', 'up10-core' ),
			),
			'public'            => false,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'show_in_quick_edit' => false,
			'hierarchical'      => false,
			'meta_box_cb'       => 'up10_senal_meta_box',
			'rewrite'           => false,
		)
	);
}

/**
 * Metabox de tipo de contenido: selección única con radios.
 *
 * @param WP_Post $post Post actual.
 */
function up10_tipo_contenido_meta_box( $post ) {
	$terms = get_terms(
		array(
			'taxonomy'   => 'tipo_contenido',
			'hide_empty' => false,
			'orderby'    => 'name',
			'order'      => 'ASC',
		)
	);

	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		echo '<p>' . esc_html__( 'No hay tipos de contenido configurados.', 'up10-core' ) . '</p>';
		return;
	}

	$assigned = wp_get_object_terms( $post->ID, 'tipo_contenido', array( 'fields' => 'ids' ) );
	$assigned = is_wp_error( $assigned ) ? array() : array_map( 'intval', $assigned );

	wp_nonce_field( 'up10_save_taxonomy_meta_box', 'up10_taxonomy_nonce' );

	echo '<fieldset>';
	echo '<legend class="screen-reader-text">' . esc_html__( 'Tipo de contenido', 'up10-core' ) . '</legend>';

	foreach ( $terms as $term ) {
		printf(
			'<label style="display:block;margin-bottom:6px"><input type="radio" name="up10_tipo_contenido" value="%1$d" %2$s> %3$s</label>',
			(int) $term->term_id,
			checked( in_array( (int) $term->term_id, $assigned, true ), true, false ),
			esc_html( $term->name )
		);
	}

	echo '</fieldset>';
}

/**
 * Metabox de señales editoriales: selección múltiple con checkboxes.
 *
 * @param WP_Post $post Post actual.
 */
function up10_senal_meta_box( $post ) {
	$terms = get_terms(
		array(
			'taxonomy'   => 'senal',
			'hide_empty' => false,
			'orderby'    => 'name',
			'order'      => 'ASC',
		)
	);

	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		echo '<p>' . esc_html__( 'No hay señales configuradas.', 'up10-core' ) . '</p>';
		return;
	}

	$assigned = wp_get_object_terms( $post->ID, 'senal', array( 'fields' => 'ids' ) );
	$assigned = is_wp_error( $assigned ) ? array() : array_map( 'intval', $assigned );

	wp_nonce_field( 'up10_save_taxonomy_meta_box', 'up10_taxonomy_nonce' );

	echo '<fieldset>';
	echo '<legend class="screen-reader-text">' . esc_html__( 'Señales editoriales', 'up10-core' ) . '</legend>';

	foreach ( $terms as $term ) {
		printf(
			'<label style="display:block;margin-bottom:6px"><input type="checkbox" name="up10_senal[]" value="%1$d" %2$s> %3$s</label>',
			(int) $term->term_id,
			checked( in_array( (int) $term->term_id, $assigned, true ), true, false ),
			esc_html( $term->name )
		);
	}

	echo '</fieldset>';
}

/**
 * Guarda los términos de los metaboxes propios.
 *
 * @param int $post_id ID del post.
 */
function up10_save_taxonomy_meta_box( $post_id ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! isset( $_POST['up10_taxonomy_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['up10_taxonomy_nonce'] ) ), 'up10_save_taxonomy_meta_box' ) ) {
		return;
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	if ( isset( $_POST['up10_tipo_contenido'] ) ) {
		$tipo_id = absint( $_POST['up10_tipo_contenido'] );
		if ( $tipo_id > 0 ) {
			wp_set_object_terms( $post_id, array( $tipo_id ), 'tipo_contenido', false );
		}
	} else {
		$assigned = wp_get_object_terms( $post_id, 'tipo_contenido', array( 'fields' => 'ids' ) );
		if ( empty( $assigned ) ) {
			$default = get_term_by( 'slug', 'noticia', 'tipo_contenido' );
			if ( $default ) {
				wp_set_object_terms( $post_id, array( (int) $default->term_id ), 'tipo_contenido', false );
			}
		}
	}

	$senales = isset( $_POST['up10_senal'] ) ? (array) wp_unslash( $_POST['up10_senal'] ) : array();
	$senales = array_values( array_filter( array_map( 'absint', $senales ) ) );
	wp_set_object_terms( $post_id, $senales, 'senal', false );
}
add_action( 'save_post_post', 'up10_save_taxonomy_meta_box' );

/**
 * Registra los CPTs de entidades.
 */
function up10_register_post_types() {
	register_post_type(
		'evento',
		array(
			'labels'        => array(
				'name'          => __( 'Eventos', 'up10-core' ),
				'singular_name' => __( 'Evento', 'up10-core' ),
				'menu_name'     => __( 'Eventos', 'up10-core' ),
			),
			'public'        => true,
			'show_in_rest'  => true,
			'has_archive'   => 'eventos',
			'rewrite'       => array( 'slug' => 'eventos' ),
			'supports'      => array( 'title', 'editor', 'excerpt', 'thumbnail' ),
			'menu_icon'     => 'dashicons-calendar-alt',
			'map_meta_cap'  => true,
			'show_in_menu'  => true,
		)
	);

	register_post_type(
		'marca',
		array(
			'labels'        => array(
				'name'          => __( 'Marcas', 'up10-core' ),
				'singular_name' => __( 'Marca', 'up10-core' ),
				'menu_name'     => __( 'Marcas', 'up10-core' ),
			),
			'public'        => false,
			'show_ui'       => true,
			'show_in_rest'  => true,
			'supports'      => array( 'title', 'thumbnail' ),
			'menu_icon'     => 'dashicons-awards',
			'map_meta_cap'  => true,
		)
	);

	register_post_type(
		'stat',
		array(
			'labels'        => array(
				'name'          => __( 'Cifras', 'up10-core' ),
				'singular_name' => __( 'Cifra', 'up10-core' ),
				'menu_name'     => __( 'Cifras', 'up10-core' ),
			),
			'public'        => false,
			'show_ui'       => true,
			'show_in_rest'  => true,
			'supports'      => array( 'title' ),
			'menu_icon'     => 'dashicons-chart-bar',
			'map_meta_cap'  => true,
		)
	);

	register_post_type(
		'track',
		array(
			'labels'        => array(
				'name'          => __( 'Ranking', 'up10-core' ),
				'singular_name' => __( 'Track', 'up10-core' ),
				'menu_name'     => __( 'Ranking', 'up10-core' ),
			),
			'public'        => false,
			'show_ui'       => true,
			'show_in_rest'  => true,
			'supports'      => array( 'title', 'thumbnail' ),
			'menu_icon'     => 'dashicons-format-audio',
			'map_meta_cap'  => true,
		)
	);

	register_post_type(
		'sesion',
		array(
			'labels'        => array(
				'name'          => __( 'Sesiones', 'up10-core' ),
				'singular_name' => __( 'Sesión', 'up10-core' ),
				'menu_name'     => __( 'Unplugged', 'up10-core' ),
			),
			'public'        => true,
			'show_in_rest'  => true,
			'has_archive'   => 'unplugged',
			'rewrite'       => array( 'slug' => 'unplugged' ),
			'supports'      => array( 'title', 'editor', 'thumbnail' ),
			'menu_icon'     => 'dashicons-video-alt3',
			'map_meta_cap'  => true,
		)
	);
}

/**
 * Siembra categorías y términos editoriales sin duplicarlos.
 */
function up10_seed_terms() {
	$categories = array(
		'Actualidad musical'          => 'actualidad-musical',
		'Música chilena'              => 'musica-chilena',
		'Música internacional'        => 'musica-internacional',
		'Conciertos y festivales'     => 'conciertos-festivales',
		'Lanzamientos'                => 'lanzamientos',
		'Entrevistas'                 => 'entrevistas',
		'Industria musical'           => 'industria-musical',
		'Cultura y entretenimiento'   => 'cultura-entretenimiento',
	);

	foreach ( $categories as $name => $slug ) {
		if ( ! term_exists( $slug, 'category' ) ) {
			wp_insert_term( $name, 'category', array( 'slug' => $slug ) );
		}
	}

	$tipos = array(
		'Noticia'    => 'noticia',
		'Entrevista' => 'entrevista',
		'Reportaje'  => 'reportaje',
	);

	foreach ( $tipos as $name => $slug ) {
		if ( ! term_exists( $slug, 'tipo_contenido' ) ) {
			wp_insert_term( $name, 'tipo_contenido', array( 'slug' => $slug ) );
		}
	}

	$senales = array(
		'Última hora' => 'ultima-hora',
		'Espectáculo' => 'espectaculo',
		'Moda'        => 'moda',
		'Exclusivo'   => 'exclusivo',
		'Destacado'   => 'destacado',
	);

	foreach ( $senales as $name => $slug ) {
		if ( ! term_exists( $slug, 'senal' ) ) {
			wp_insert_term( $name, 'senal', array( 'slug' => $slug ) );
		}
	}
}
