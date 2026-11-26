<?php
/**
 * Grupos de campos editoriales (Secure Custom Fields).
 *
 * @package UP10_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Guarda y carga los grupos SCF desde el plugin, no desde el tema.
 *
 * @param string $path Ruta actual.
 * @return string
 */
function up10_scf_json_save_point( $path ) {
	unset( $path );
	return UP10_CORE_PATH . 'acf-json';
}
add_filter( 'acf/settings/save_json', 'up10_scf_json_save_point' );

/**
 * Agrega la ruta del plugin a las rutas de carga.
 *
 * @param array $paths Rutas.
 * @return array
 */
function up10_scf_json_load_point( $paths ) {
	$paths[] = UP10_CORE_PATH . 'acf-json';
	return $paths;
}
add_filter( 'acf/settings/load_json', 'up10_scf_json_load_point' );

/**
 * Registra todos los grupos de campos locales.
 */
function up10_register_field_groups() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	up10_register_article_fields();
	up10_register_stat_fields();
	up10_register_event_fields();
	up10_register_brand_fields();
	up10_register_track_fields();
	up10_register_session_fields();
	up10_register_page_fields();
	up10_register_options_fields();
}

/**
 * Página de ajustes globales.
 */
function up10_register_options_pages() {
	if ( ! function_exists( 'acf_add_options_page' ) ) {
		return;
	}

	acf_add_options_page(
		array(
			'page_title'  => __( 'Ajustes UP10', 'up10-core' ),
			'menu_title'  => __( 'Ajustes UP10', 'up10-core' ),
			'menu_slug'   => 'up10-settings',
			'capability'  => 'manage_options',
			'redirect'    => false,
			'position'    => 59,
			'icon_url'    => 'dashicons-admin-generic',
			'update_button' => __( 'Guardar ajustes', 'up10-core' ),
		)
	);
}

/**
 * Grupo de artículo.
 */
function up10_register_article_fields() {
	acf_add_local_field_group(
		array(
			'key'                   => 'group_up10_article',
			'title'                 => __( 'Artículo — UP10', 'up10-core' ),
			'fields'                => array(
				array(
					'key'   => 'field_up10_article_tab_content',
					'label' => __( 'Contenido', 'up10-core' ),
					'type'  => 'tab',
				),
				array(
					'key'          => 'field_up10_dek',
					'label'        => __( 'Bajada manual (opcional)', 'up10-core' ),
					'name'         => 'dek',
					'type'         => 'textarea',
					'instructions' => __( 'Si se deja vacío, se usa el primer párrafo del contenido. Solo complétalo si quieres una bajada distinta.', 'up10-core' ),
					'required'     => 0,
					'rows'         => 3,
					'maxlength'    => 240,
				),
				array(
					'key'   => 'field_up10_article_tab_media',
					'label' => __( 'Multimedia (opcional)', 'up10-core' ),
					'type'  => 'tab',
				),
				array(
					'key'           => 'field_up10_focal_point',
					'label'         => __( 'Punto focal de la portada', 'up10-core' ),
					'name'          => 'focal_point',
					'type'          => 'select',
					'choices'       => array(
						'center' => __( 'Centro', 'up10-core' ),
						'top'    => __( 'Arriba', 'up10-core' ),
						'bottom' => __( 'Abajo', 'up10-core' ),
						'left'   => __( 'Izquierda', 'up10-core' ),
						'right'  => __( 'Derecha', 'up10-core' ),
					),
					'default_value' => 'center',
					'ui'            => 1,
				),
				array(
					'key'           => 'field_up10_gallery',
					'label'         => __( 'Galería', 'up10-core' ),
					'name'          => 'gallery',
					'type'          => 'gallery',
					'instructions'  => __( 'Opcional. Si se usa, hasta 12 imágenes.', 'up10-core' ),
					'return_format' => 'id',
					'preview_size'  => 'medium',
					'max'           => 12,
				),
				array(
					'key'          => 'field_up10_video_url',
					'label'        => __( 'Video de YouTube', 'up10-core' ),
					'name'         => 'video_url',
					'type'         => 'url',
					'instructions' => __( 'Solo YouTube. Se extrae el ID para el embed.', 'up10-core' ),
				),
				array(
					'key'   => 'field_up10_article_tab_related',
					'label' => __( 'Relacionados (opcional)', 'up10-core' ),
					'type'  => 'tab',
				),
				array(
					'key'          => 'field_up10_related',
					'label'        => __( 'Noticias relacionadas', 'up10-core' ),
					'name'         => 'related',
					'type'         => 'relationship',
					'instructions' => __( 'Máximo 3. Si se deja vacío, el frontend sugiere por categoría.', 'up10-core' ),
					'post_type'    => array( 'post' ),
					'filters'      => array( 'search' ),
					'return_format' => 'id',
					'max'          => 3,
				),
				array(
					'key'   => 'field_up10_article_tab_seo',
					'label' => __( 'SEO (opcional — automático)', 'up10-core' ),
					'type'  => 'tab',
				),
				array(
					'key'       => 'field_up10_article_seo_message',
					'label'     => '',
					'type'      => 'message',
					'message'   => __( 'Todo es opcional. Si dejas los campos vacíos, se usan el titular, la bajada y la imagen principal.', 'up10-core' ),
					'new_lines' => 'wpautop',
					'esc_html'  => 1,
				),
				array(
					'key'        => 'field_up10_seo',
					'label'      => __( 'Metadatos SEO', 'up10-core' ),
					'name'       => 'seo',
					'type'       => 'group',
					'layout'     => 'block',
					'sub_fields' => array(
						array(
							'key'          => 'field_up10_seo_title',
							'label'        => __( 'Título SEO', 'up10-core' ),
							'name'         => 'seo_title',
							'type'         => 'text',
							'instructions' => __( 'Si se deja vacío, se usa el titular de la nota.', 'up10-core' ),
							'maxlength'    => 60,
						),
						array(
							'key'          => 'field_up10_seo_description',
							'label'        => __( 'Descripción SEO', 'up10-core' ),
							'name'         => 'seo_description',
							'type'         => 'textarea',
							'instructions' => __( 'Si se deja vacío, se usa la bajada (primer párrafo).', 'up10-core' ),
							'rows'         => 2,
							'maxlength'    => 160,
						),
						array(
							'key'           => 'field_up10_seo_og_image',
							'label'         => __( 'Imagen OG', 'up10-core' ),
							'name'          => 'seo_og_image',
							'type'          => 'image',
							'instructions'  => __( 'Si se deja vacío, se usa la imagen principal.', 'up10-core' ),
							'return_format' => 'id',
							'preview_size'  => 'medium',
						),
						array(
							'key'          => 'field_up10_seo_canonical',
							'label'        => __( 'Canonical', 'up10-core' ),
							'name'         => 'seo_canonical',
							'type'         => 'url',
							'instructions' => __( 'Normalmente no hace falta: el frontend usa la URL de la nota.', 'up10-core' ),
						),
						array(
							'key'          => 'field_up10_seo_noindex',
							'label'        => __( 'No indexar', 'up10-core' ),
							'name'         => 'seo_noindex',
							'type'         => 'true_false',
							'instructions' => __( 'Actívalo solo si la nota no debe aparecer en buscadores.', 'up10-core' ),
							'ui'           => 1,
						),
					),
				),
			),
			'location'              => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'post',
					),
				),
			),
			'menu_order'            => 0,
			'position'              => 'normal',
			'style'                 => 'default',
			'label_placement'       => 'top',
			'instruction_placement' => 'label',
			'active'                => true,
			'show_in_rest'          => true,
		)
	);
}

/**
 * Grupo de cifras.
 */
function up10_register_stat_fields() {
	acf_add_local_field_group(
		array(
			'key'      => 'group_up10_stat',
			'title'    => __( 'Cifra — UP10', 'up10-core' ),
			'fields'   => array(
				array(
					'key'   => 'field_up10_stat_label',
					'label' => __( 'Etiqueta', 'up10-core' ),
					'name'  => 'label',
					'type'  => 'text',
					'required' => 1,
				),
				array(
					'key'   => 'field_up10_stat_short_label',
					'label' => __( 'Etiqueta corta', 'up10-core' ),
					'name'  => 'short_label',
					'type'  => 'text',
				),
				array(
					'key'      => 'field_up10_stat_value',
					'label'    => __( 'Valor', 'up10-core' ),
					'name'     => 'value',
					'type'     => 'number',
					'required' => 1,
				),
				array(
					'key'   => 'field_up10_stat_prefix',
					'label' => __( 'Prefijo', 'up10-core' ),
					'name'  => 'prefix',
					'type'  => 'text',
				),
				array(
					'key'   => 'field_up10_stat_suffix',
					'label' => __( 'Sufijo', 'up10-core' ),
					'name'  => 'suffix',
					'type'  => 'text',
				),
				array(
					'key'           => 'field_up10_stat_format',
					'label'         => __( 'Formato', 'up10-core' ),
					'name'          => 'format',
					'type'          => 'select',
					'choices'       => array(
						'number' => __( 'Número con separador de miles', 'up10-core' ),
						'plain'  => __( 'Texto plano (años)', 'up10-core' ),
					),
					'default_value' => 'number',
				),
				array(
					'key'           => 'field_up10_stat_animated',
					'label'         => __( 'Animar cifra', 'up10-core' ),
					'name'          => 'animated',
					'type'          => 'true_false',
					'instructions'  => __( 'Desactivar para años o cifras que deben aparecer fijas.', 'up10-core' ),
					'ui'            => 1,
					'default_value' => 1,
				),
				array(
					'key'   => 'field_up10_stat_sort_order',
					'label' => __( 'Orden', 'up10-core' ),
					'name'  => 'sort_order',
					'type'  => 'number',
					'min'   => 1,
					'max'   => 3,
				),
			),
			'location' => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'stat',
					),
				),
			),
			'position' => 'normal',
			'active'   => true,
		)
	);
}

/**
 * Grupo de eventos.
 */
function up10_register_event_fields() {
	acf_add_local_field_group(
		array(
			'key'      => 'group_up10_event',
			'title'    => __( 'Evento — UP10', 'up10-core' ),
			'fields'   => array(
				array(
					'key'           => 'field_up10_event_date',
					'label'         => __( 'Fecha', 'up10-core' ),
					'name'          => 'event_date',
					'type'          => 'date_picker',
					'required'      => 1,
					'display_format' => 'd/m/Y',
					'return_format' => 'Y-m-d',
				),
				array(
					'key'           => 'field_up10_event_time',
					'label'         => __( 'Hora', 'up10-core' ),
					'name'          => 'event_time',
					'type'          => 'time_picker',
					'display_format' => 'H:i',
					'return_format' => 'H:i',
				),
				array(
					'key'      => 'field_up10_event_venue',
					'label'    => __( 'Recinto', 'up10-core' ),
					'name'     => 'venue',
					'type'     => 'text',
					'required' => 1,
				),
				array(
					'key'      => 'field_up10_event_city',
					'label'    => __( 'Ciudad', 'up10-core' ),
					'name'     => 'city',
					'type'     => 'text',
					'required' => 1,
				),
				array(
					'key'          => 'field_up10_event_lineup',
					'label'        => __( 'Lineup', 'up10-core' ),
					'name'         => 'lineup',
					'type'         => 'repeater',
					'instructions' => __( 'Máximo 10 artistas.', 'up10-core' ),
					'max'          => 10,
					'layout'       => 'table',
					'button_label' => __( 'Añadir artista', 'up10-core' ),
					'sub_fields'   => array(
						array(
							'key'   => 'field_up10_event_lineup_name',
							'label' => __( 'Nombre', 'up10-core' ),
							'name'  => 'name',
							'type'  => 'text',
						),
						array(
							'key'   => 'field_up10_event_lineup_url',
							'label' => __( 'URL', 'up10-core' ),
							'name'  => 'url',
							'type'  => 'url',
						),
					),
				),
				array(
					'key'   => 'field_up10_event_ticket_url',
					'label' => __( 'Entradas', 'up10-core' ),
					'name'  => 'ticket_url',
					'type'  => 'url',
				),
				array(
					'key'        => 'field_up10_event_seo',
					'label'      => __( 'SEO', 'up10-core' ),
					'name'       => 'seo',
					'type'       => 'group',
					'layout'     => 'block',
					'sub_fields' => array(
						array(
							'key'       => 'field_up10_event_seo_title',
							'label'     => __( 'Título SEO', 'up10-core' ),
							'name'      => 'seo_title',
							'type'      => 'text',
							'maxlength' => 60,
						),
						array(
							'key'       => 'field_up10_event_seo_description',
							'label'     => __( 'Descripción SEO', 'up10-core' ),
							'name'      => 'seo_description',
							'type'      => 'textarea',
							'rows'      => 2,
							'maxlength' => 160,
						),
						array(
							'key'   => 'field_up10_event_seo_noindex',
							'label' => __( 'No indexar', 'up10-core' ),
							'name'  => 'seo_noindex',
							'type'  => 'true_false',
							'ui'    => 1,
						),
					),
				),
			),
			'location' => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'evento',
					),
				),
			),
			'position' => 'normal',
			'active'   => true,
		)
	);
}

/**
 * Grupo de marcas.
 */
function up10_register_brand_fields() {
	acf_add_local_field_group(
		array(
			'key'      => 'group_up10_brand',
			'title'    => __( 'Marca — UP10', 'up10-core' ),
			'fields'   => array(
				array(
					'key'           => 'field_up10_brand_logo',
					'label'         => __( 'Logo', 'up10-core' ),
					'name'          => 'logo',
					'type'          => 'image',
					'return_format' => 'id',
					'preview_size'  => 'medium',
					'mime_types'    => 'png,webp',
					'instructions'  => __( 'PNG o WebP con fondo transparente, en color crema (#FAE3B9). Se muestra sobre una banda vino.', 'up10-core' ),
				),
				array(
					'key'   => 'field_up10_brand_website',
					'label' => __( 'Sitio web', 'up10-core' ),
					'name'  => 'website',
					'type'  => 'url',
				),
				array(
					'key'          => 'field_up10_brand_sort_order',
					'label'        => __( 'Orden', 'up10-core' ),
					'name'         => 'sort_order',
					'type'         => 'number',
					'min'          => 1,
					'max'          => 999,
					'instructions' => __( 'Si queda vacío, la marca se muestra al final de la marquesina.', 'up10-core' ),
				),
			),
			'location' => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'marca',
					),
				),
			),
			'position' => 'normal',
			'active'   => true,
		)
	);
}

/**
 * Grupo de ranking.
 */
function up10_register_track_fields() {
	acf_add_local_field_group(
		array(
			'key'      => 'group_up10_track',
			'title'    => __( 'Track — UP10', 'up10-core' ),
			'fields'   => array(
				array(
					'key'   => 'field_up10_track_artist',
					'label' => __( 'Artista', 'up10-core' ),
					'name'  => 'artist',
					'type'  => 'text',
				),
				array(
					'key'      => 'field_up10_track_position',
					'label'    => __( 'Posición', 'up10-core' ),
					'name'     => 'position',
					'type'     => 'number',
					'required' => 1,
					'min'      => 1,
					'max'      => 10,
				),
				array(
					'key'   => 'field_up10_track_previous_position',
					'label' => __( 'Posición anterior', 'up10-core' ),
					'name'  => 'previous_position',
					'type'  => 'number',
					'min'   => 1,
					'max'   => 10,
				),
				array(
					'key'           => 'field_up10_track_movement',
					'label'         => __( 'Movimiento', 'up10-core' ),
					'name'          => 'movement',
					'type'          => 'select',
					'choices'       => array(
						'up'   => __( 'Sube', 'up10-core' ),
						'down' => __( 'Baja', 'up10-core' ),
						'same' => __( 'Se mantiene', 'up10-core' ),
						'new'  => __( 'Nuevo', 'up10-core' ),
					),
					'default_value' => 'same',
				),
				array(
					'key'   => 'field_up10_track_is_new',
					'label' => __( 'Nueva entrada', 'up10-core' ),
					'name'  => 'is_new',
					'type'  => 'true_false',
					'ui'    => 1,
				),
				array(
					'key'   => 'field_up10_track_spotify_url',
					'label' => __( 'URL de Spotify', 'up10-core' ),
					'name'  => 'spotify_url',
					'type'  => 'url',
				),
				array(
					'key'   => 'field_up10_track_spotify_id',
					'label' => __( 'Spotify ID', 'up10-core' ),
					'name'  => 'spotify_id',
					'type'  => 'text',
				),
				array(
					'key'           => 'field_up10_track_source',
					'label'         => __( 'Origen', 'up10-core' ),
					'name'          => 'source',
					'type'          => 'select',
					'choices'       => array(
						'spotify' => __( 'Spotify', 'up10-core' ),
						'manual'  => __( 'Manual', 'up10-core' ),
					),
					'default_value' => 'manual',
				),
			),
			'location' => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'track',
					),
				),
			),
			'position' => 'normal',
			'active'   => true,
		)
	);
}

/**
 * Grupo de sesiones Unplugged.
 */
function up10_register_session_fields() {
	acf_add_local_field_group(
		array(
			'key'      => 'group_up10_session',
			'title'    => __( 'Sesión — UP10', 'up10-core' ),
			'fields'   => array(
				array(
					'key'   => 'field_up10_session_artist',
					'label' => __( 'Artista', 'up10-core' ),
					'name'  => 'artist',
					'type'  => 'text',
				),
				array(
					'key'           => 'field_up10_session_date',
					'label'         => __( 'Fecha', 'up10-core' ),
					'name'          => 'session_date',
					'type'          => 'date_picker',
					'display_format' => 'd/m/Y',
					'return_format' => 'Y-m-d',
				),
				array(
					'key'           => 'field_up10_session_gallery',
					'label'         => __( 'Galería', 'up10-core' ),
					'name'          => 'gallery',
					'type'          => 'gallery',
					'return_format' => 'id',
					'preview_size'  => 'medium',
				),
				array(
					'key'   => 'field_up10_session_video_url',
					'label' => __( 'Video de YouTube', 'up10-core' ),
					'name'  => 'video_url',
					'type'  => 'url',
				),
			),
			'location' => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'sesion',
					),
				),
			),
			'position' => 'normal',
			'active'   => true,
		)
	);
}

/**
 * Grupo de páginas institucionales.
 */
function up10_register_page_fields() {
	acf_add_local_field_group(
		array(
			'key'      => 'group_up10_page',
			'title'    => __( 'Página — UP10', 'up10-core' ),
			'fields'   => array(
				array(
					'key'        => 'field_up10_page_hero',
					'label'      => __( 'Hero', 'up10-core' ),
					'name'       => 'hero',
					'type'       => 'group',
					'layout'     => 'block',
					'sub_fields' => array(
						array(
							'key'   => 'field_up10_page_hero_title',
							'label' => __( 'Título', 'up10-core' ),
							'name'  => 'title',
							'type'  => 'text',
						),
						array(
							'key'   => 'field_up10_page_hero_subtitle',
							'label' => __( 'Bajada', 'up10-core' ),
							'name'  => 'subtitle',
							'type'  => 'textarea',
							'rows'  => 2,
						),
						array(
							'key'           => 'field_up10_page_hero_image',
							'label'         => __( 'Imagen', 'up10-core' ),
							'name'          => 'image',
							'type'          => 'image',
							'return_format' => 'id',
							'preview_size'  => 'medium',
						),
					),
				),
				array(
					'key'        => 'field_up10_page_seo',
					'label'      => __( 'SEO', 'up10-core' ),
					'name'       => 'seo',
					'type'       => 'group',
					'layout'     => 'block',
					'sub_fields' => array(
						array(
							'key'       => 'field_up10_page_seo_title',
							'label'     => __( 'Título SEO', 'up10-core' ),
							'name'      => 'seo_title',
							'type'      => 'text',
							'maxlength' => 60,
						),
						array(
							'key'       => 'field_up10_page_seo_description',
							'label'     => __( 'Descripción SEO', 'up10-core' ),
							'name'      => 'seo_description',
							'type'      => 'textarea',
							'rows'      => 2,
							'maxlength' => 160,
						),
						array(
							'key'   => 'field_up10_page_seo_noindex',
							'label' => __( 'No indexar', 'up10-core' ),
							'name'  => 'seo_noindex',
							'type'  => 'true_false',
							'ui'    => 1,
						),
					),
				),
			),
			'location' => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'page',
					),
				),
			),
			'position' => 'normal',
			'active'   => true,
		)
	);
}

/**
 * Ajustes globales.
 */
function up10_register_options_fields() {
	acf_add_local_field_group(
		array(
			'key'      => 'group_up10_options',
			'title'    => __( 'Ajustes globales — UP10', 'up10-core' ),
			'fields'   => array(
				array(
					'key'   => 'field_up10_options_tab_social',
					'label' => __( 'Redes', 'up10-core' ),
					'type'  => 'tab',
				),
				array(
					'key'   => 'field_up10_social_instagram',
					'label' => __( 'Instagram', 'up10-core' ),
					'name'  => 'social_instagram',
					'type'  => 'url',
				),
				array(
					'key'   => 'field_up10_social_tiktok',
					'label' => __( 'TikTok', 'up10-core' ),
					'name'  => 'social_tiktok',
					'type'  => 'url',
				),
				array(
					'key'   => 'field_up10_social_facebook',
					'label' => __( 'Facebook', 'up10-core' ),
					'name'  => 'social_facebook',
					'type'  => 'url',
				),
				array(
					'key'   => 'field_up10_social_youtube',
					'label' => __( 'YouTube', 'up10-core' ),
					'name'  => 'social_youtube',
					'type'  => 'url',
				),
				array(
					'key'   => 'field_up10_social_whatsapp',
					'label' => __( 'WhatsApp', 'up10-core' ),
					'name'  => 'social_whatsapp',
					'type'  => 'url',
				),
				array(
					'key'   => 'field_up10_press_email',
					'label' => __( 'Correo de prensa', 'up10-core' ),
					'name'  => 'press_email',
					'type'  => 'email',
				),
				array(
					'key'   => 'field_up10_options_tab_top10',
					'label' => __( 'TOP 10', 'up10-core' ),
					'type'  => 'tab',
				),
				array(
					'key'   => 'field_up10_top10_playlist_url',
					'label' => __( 'URL de la playlist', 'up10-core' ),
					'name'  => 'top10_playlist_url',
					'type'  => 'url',
				),
				array(
					'key'   => 'field_up10_top10_sync_enabled',
					'label' => __( 'Activar sync de Spotify', 'up10-core' ),
					'name'  => 'top10_sync_enabled',
					'type'  => 'true_false',
					'ui'    => 1,
				),
				array(
					'key'   => 'field_up10_options_tab_instagram',
					'label' => __( 'Instagram', 'up10-core' ),
					'type'  => 'tab',
				),
				array(
					'key'           => 'field_up10_instagram_mode',
					'label'         => __( 'Modo', 'up10-core' ),
					'name'          => 'instagram_mode',
					'type'          => 'select',
					'choices'       => array(
						'curated' => __( 'Curado', 'up10-core' ),
						'api'     => __( 'API de Instagram', 'up10-core' ),
					),
					'instructions' => __( 'El modo API se actualiza automáticamente y es el modo por defecto. Si no hay caché disponible, se muestran las publicaciones curadas como respaldo.', 'up10-core' ),
					'default_value' => 'api',
				),
				array(
					'key'          => 'field_up10_instagram_posts',
					'label'        => __( 'Publicaciones curadas', 'up10-core' ),
					'name'         => 'instagram_posts',
					'type'         => 'repeater',
					'instructions' => __( 'Se usa en modo curado y como respaldo si la API no tiene una caché disponible.', 'up10-core' ),
					'max'          => 10,
					'layout'       => 'block',
					'button_label' => __( 'Añadir publicación', 'up10-core' ),
					'sub_fields'   => array(
						array(
							'key'           => 'field_up10_instagram_image',
							'label'         => __( 'Imagen', 'up10-core' ),
							'name'          => 'image',
							'type'          => 'image',
							'return_format' => 'id',
							'preview_size'  => 'medium',
						),
						array(
							'key'   => 'field_up10_instagram_permalink',
							'label' => __( 'Permalink', 'up10-core' ),
							'name'  => 'permalink',
							'type'  => 'url',
						),
						array(
							'key'   => 'field_up10_instagram_caption',
							'label' => __( 'Texto alternativo / caption', 'up10-core' ),
							'name'  => 'caption',
							'type'  => 'text',
						),
						array(
							'key'   => 'field_up10_instagram_type',
							'label' => __( 'Tipo', 'up10-core' ),
							'name'  => 'type',
							'type'  => 'select',
							'choices' => array(
								'image'    => __( 'Imagen', 'up10-core' ),
								'carousel' => __( 'Carrusel', 'up10-core' ),
								'video'    => __( 'Video', 'up10-core' ),
							),
							'default_value' => 'image',
						),
						array(
							'key'   => 'field_up10_instagram_published_at',
							'label' => __( 'Fecha de publicación', 'up10-core' ),
							'name'  => 'published_at',
							'type'  => 'date_time_picker',
							'display_format' => 'd/m/Y H:i',
							'return_format' => 'c',
						),
					),
				),
				array(
					'key'   => 'field_up10_options_tab_newsletter',
					'label' => __( 'Newsletter', 'up10-core' ),
					'type'  => 'tab',
				),
				array(
					'key'   => 'field_up10_newsletter_title',
					'label' => __( 'Título', 'up10-core' ),
					'name'  => 'newsletter_title',
					'type'  => 'text',
				),
				array(
					'key'   => 'field_up10_newsletter_description',
					'label' => __( 'Bajada', 'up10-core' ),
					'name'  => 'newsletter_description',
					'type'  => 'textarea',
					'rows'  => 2,
				),
				array(
					'key'   => 'field_up10_newsletter_consent',
					'label' => __( 'Texto de consentimiento', 'up10-core' ),
					'name'  => 'newsletter_consent',
					'type'  => 'textarea',
					'rows'  => 2,
				),
				array(
					'key'   => 'field_up10_options_tab_contact',
					'label' => __( 'Contacto', 'up10-core' ),
					'type'  => 'tab',
				),
				array(
					'key'   => 'field_up10_contact_email',
					'label' => __( 'Correo', 'up10-core' ),
					'name'  => 'contact_email',
					'type'  => 'email',
				),
				array(
					'key'   => 'field_up10_contact_whatsapp',
					'label' => __( 'WhatsApp', 'up10-core' ),
					'name'  => 'contact_whatsapp',
					'type'  => 'text',
				),
				array(
					'key'   => 'field_up10_contact_address',
					'label' => __( 'Dirección', 'up10-core' ),
					'name'  => 'contact_address',
					'type'  => 'textarea',
					'rows'  => 2,
				),
			),
			'location' => array(
				array(
					array(
						'param'    => 'options_page',
						'operator' => '==',
						'value'    => 'up10-settings',
					),
				),
			),
			'position' => 'normal',
			'active'   => true,
		)
	);
}
