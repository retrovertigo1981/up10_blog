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
			'show_admin_column' => false,
			'show_in_quick_edit' => false,
			'hierarchical'      => false,
			'meta_box_cb'       => false,
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
			'show_admin_column' => false,
			'show_in_quick_edit' => false,
			'hierarchical'      => false,
			'meta_box_cb'       => false,
			'rewrite'           => false,
		)
	);
}

/**
 * Metabox de sección: selección única de categoría.
 *
 * @param WP_Post $post Post actual.
 */
function up10_seccion_meta_box( $post ) {
	$terms = get_terms(
		array(
			'taxonomy'   => 'category',
			'hide_empty' => false,
			'orderby'    => 'term_id',
			'order'      => 'ASC',
		)
	);

	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		echo '<p>' . esc_html__( 'No hay secciones configuradas.', 'up10-core' ) . '</p>';
		return;
	}

	$assigned = wp_get_post_categories( $post->ID, array( 'fields' => 'ids' ) );
	$assigned = array_map( 'intval', $assigned );
	$current  = $assigned ? $assigned[0] : 0;

	// Oculta la categoría genérica de WordPress si no está asignada.
	$default_category_id = (int) get_option( 'default_category' );
	$visible_terms       = array_values(
		array_filter(
			$terms,
			static function ( $term ) use ( $default_category_id, $current ) {
				if ( (int) $term->term_id !== $default_category_id ) {
					return true;
				}

				return $current === (int) $term->term_id;
			}
		)
	);

	if ( ! empty( $visible_terms ) ) {
		$terms = $visible_terms;
	}

	wp_nonce_field( 'up10_save_taxonomy_meta_box', 'up10_taxonomy_nonce' );

	echo '<fieldset>';
	echo '<legend class="screen-reader-text">' . esc_html__( 'Sección', 'up10-core' ) . '</legend>';
	echo '<p class="description" style="margin-top:0">' . esc_html__( 'Es la sección del menú y la etiqueta que aparece en las tarjetas. Elige una.', 'up10-core' ) . '</p>';

	foreach ( $terms as $term ) {
		printf(
			'<label style="display:block;margin-bottom:6px"><input type="radio" name="up10_seccion" value="%1$d" %2$s> %3$s</label>',
			(int) $term->term_id,
			checked( $current === (int) $term->term_id, true, false ),
			esc_html( $term->name )
		);
	}

	if ( count( $assigned ) > 1 ) {
		echo '<p class="description" style="color:#b32d2e;margin-top:8px">';
		echo esc_html__( 'Esta nota tiene varias secciones asignadas. Al guardar quedará solo la que elijas.', 'up10-core' );
		echo '</p>';
	}

	echo '</fieldset>';
}

/**
 * Registra los metaboxes de clasificación en la barra lateral.
 */
function up10_add_editorial_meta_boxes() {
	add_meta_box(
		'up10_seccion',
		__( 'Sección', 'up10-core' ),
		'up10_seccion_meta_box',
		'post',
		'side',
		'high'
	);

	add_meta_box(
		'up10_tipo_contenido',
		__( 'Formato', 'up10-core' ),
		'up10_tipo_contenido_meta_box',
		'post',
		'side',
		'default'
	);

	add_meta_box(
		'up10_senal',
		__( 'Última hora', 'up10-core' ),
		'up10_senal_meta_box',
		'post',
		'side',
		'default'
	);
}
add_action( 'add_meta_boxes_post', 'up10_add_editorial_meta_boxes' );

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
			'orderby'    => 'term_id',
			'order'      => 'ASC',
		)
	);

	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		echo '<p>' . esc_html__( 'No hay tipos de contenido configurados.', 'up10-core' ) . '</p>';
		return;
	}

	$assigned = wp_get_object_terms( $post->ID, 'tipo_contenido', array( 'fields' => 'ids' ) );
	$assigned = is_wp_error( $assigned ) ? array() : array_map( 'intval', $assigned );

	if ( empty( $assigned ) ) {
		$default = get_term_by( 'slug', 'noticia', 'tipo_contenido' );
		if ( $default ) {
			$assigned = array( (int) $default->term_id );
		}
	}

	$descriptions = array(
		'noticia'    => __( 'Información de actualidad.', 'up10-core' ),
		'entrevista' => __( 'Conversación con un artista o protagonista. Activa la sección de entrevistas y el bloque de portada.', 'up10-core' ),
		'reportaje'  => __( 'Formato largo, con más contexto y aire.', 'up10-core' ),
	);

	wp_nonce_field( 'up10_save_taxonomy_meta_box', 'up10_taxonomy_nonce' );

	echo '<fieldset>';
	echo '<legend class="screen-reader-text">' . esc_html__( 'Tipo de contenido', 'up10-core' ) . '</legend>';
	echo '<p class="description" style="margin-top:0">' . esc_html__( 'Obligatorio. Elige cómo se presenta la nota.', 'up10-core' ) . '</p>';

	foreach ( $terms as $term ) {
		printf(
			'<label style="display:block;margin-bottom:8px"><input type="radio" name="up10_tipo_contenido" value="%1$d" %2$s> <strong>%3$s</strong>',
			(int) $term->term_id,
			checked( in_array( (int) $term->term_id, $assigned, true ), true, false ),
			esc_html( $term->name )
		);

		if ( isset( $descriptions[ $term->slug ] ) ) {
			printf(
				'<br><span class="description" style="display:block;margin-left:22px">%s</span>',
				esc_html( $descriptions[ $term->slug ] )
			);
		}

		echo '</label>';
	}

	echo '</fieldset>';
}

/**
 * Metabox de última hora.
 *
 * @param WP_Post $post Post actual.
 */
function up10_senal_meta_box( $post ) {
	$term = get_term_by( 'slug', 'ultima-hora', 'senal' );

	if ( ! $term || is_wp_error( $term ) ) {
		echo '<p>' . esc_html__( 'La señal de última hora no está configurada.', 'up10-core' ) . '</p>';
		return;
	}

	$assigned = wp_get_object_terms( $post->ID, 'senal', array( 'fields' => 'ids' ) );
	$assigned = is_wp_error( $assigned ) ? array() : array_map( 'intval', $assigned );

	wp_nonce_field( 'up10_save_taxonomy_meta_box', 'up10_taxonomy_nonce' );

	echo '<fieldset>';
	echo '<legend class="screen-reader-text">' . esc_html__( 'Última hora', 'up10-core' ) . '</legend>';
	echo '<p class="description" style="margin-top:0">' . esc_html__( 'Prioriza la nota en el hero y activa la insignia. Desmárcala cuando deje de ser última hora.', 'up10-core' ) . '</p>';

	printf(
		'<label style="display:block"><input type="checkbox" name="up10_senal[]" value="%1$d" %2$s> %3$s</label>',
		(int) $term->term_id,
		checked( in_array( (int) $term->term_id, $assigned, true ), true, false ),
		esc_html( $term->name )
	);

	echo '</fieldset>';
}

/**
 * Guarda la sección, el formato y la señal de última hora.
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

	// Sección: exactamente una categoría.
	if ( isset( $_POST['up10_seccion'] ) ) {
		$seccion_id = absint( $_POST['up10_seccion'] );
		if ( $seccion_id > 0 ) {
			wp_set_post_categories( $post_id, array( $seccion_id ) );
		}
	} else {
		$assigned = wp_get_post_categories( $post_id );
		if ( empty( $assigned ) ) {
			$default = get_term_by( 'slug', 'actualidad-musical', 'category' );
			if ( $default ) {
				wp_set_post_categories( $post_id, array( (int) $default->term_id ) );
			}
		}
	}

	// Formato: por defecto Noticia.
	$tipo_id = isset( $_POST['up10_tipo_contenido'] ) ? absint( $_POST['up10_tipo_contenido'] ) : 0;

	if ( $tipo_id > 0 ) {
		wp_set_object_terms( $post_id, array( $tipo_id ), 'tipo_contenido', false );
	} else {
		$assigned = wp_get_object_terms( $post_id, 'tipo_contenido', array( 'fields' => 'ids' ) );
		if ( empty( $assigned ) ) {
			$default = get_term_by( 'slug', 'noticia', 'tipo_contenido' );
			if ( $default ) {
				wp_set_object_terms( $post_id, array( (int) $default->term_id ), 'tipo_contenido', false );
			}
		}
	}

	// Si la sección es Entrevistas y el formato sigue en Noticia, se marca Entrevista.
	$secciones = wp_get_post_categories( $post_id, array( 'fields' => 'slugs' ) );
	if ( ! is_wp_error( $secciones ) && in_array( 'entrevistas', $secciones, true ) ) {
		$tipos = wp_get_object_terms( $post_id, 'tipo_contenido', array( 'fields' => 'slugs' ) );
		if ( ! is_wp_error( $tipos ) && in_array( 'noticia', $tipos, true ) ) {
			$entrevista = get_term_by( 'slug', 'entrevista', 'tipo_contenido' );
			if ( $entrevista ) {
				wp_set_object_terms( $post_id, array( (int) $entrevista->term_id ), 'tipo_contenido', false );
			}
		}
	}

	// Señal visible: solo última hora.
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

	$default_category = get_term_by( 'slug', 'actualidad-musical', 'category' );
	if ( $default_category ) {
		update_option( 'default_category', (int) $default_category->term_id );
	}
}
