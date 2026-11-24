<?php
/**
 * Experiencia editorial del admin.
 *
 * @package UP10_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Quita metaboxes nativos que duplican o estorban.
 */
function up10_remove_default_meta_boxes() {
	remove_meta_box( 'categorydiv', 'post', 'side' );
	remove_meta_box( 'tagsdiv-post_tag', 'post', 'side' );
	remove_meta_box( 'postexcerpt', 'post', 'normal' );
}
add_action( 'add_meta_boxes', 'up10_remove_default_meta_boxes' );

/**
 * Limpia el menú para editores.
 *
 * Los administradores conservan las pantallas de gestión de términos.
 * Se puede forzar el ocultamiento con el filtro `up10_hide_taxonomy_menus`.
 */
function up10_clean_admin_menu() {
	$hide = (bool) apply_filters( 'up10_hide_taxonomy_menus', ! current_user_can( 'manage_options' ) );

	if ( ! $hide ) {
		return;
	}

	remove_submenu_page( 'edit.php', 'edit-tags.php?taxonomy=category' );
	remove_submenu_page( 'edit.php', 'edit-tags.php?taxonomy=post_tag' );
	remove_submenu_page( 'edit.php', 'edit-tags.php?taxonomy=tipo_contenido' );
	remove_submenu_page( 'edit.php', 'edit-tags.php?taxonomy=senal' );
	remove_menu_page( 'edit-comments.php' );
	remove_menu_page( 'tools.php' );
}
add_action( 'admin_menu', 'up10_clean_admin_menu', 999 );

/**
 * Agrega columnas útiles al listado de notas.
 *
 * @param array $columns Columnas.
 * @return array
 */
function up10_posts_columns( $columns ) {
	$screen = get_current_screen();

	if ( ! $screen || 'post' !== $screen->post_type ) {
		return $columns;
	}

	$new = array();

	foreach ( $columns as $key => $label ) {
		$new[ $key ] = $label;

		if ( 'title' === $key ) {
			$new['up10_thumb']    = __( 'Imagen', 'up10-core' );
			$new['up10_seccion']  = __( 'Sección', 'up10-core' );
			$new['up10_formato']  = __( 'Formato', 'up10-core' );
			$new['up10_breaking'] = __( 'Última hora', 'up10-core' );
		}
	}

	return $new;
}
add_filter( 'manage_posts_columns', 'up10_posts_columns' );

/**
 * Pinta las columnas propias.
 *
 * @param string $column  Columna.
 * @param int    $post_id ID del post.
 */
function up10_posts_custom_column( $column, $post_id ) {
	if ( 'post' !== get_post_type( $post_id ) ) {
		return;
	}

	switch ( $column ) {
		case 'up10_thumb':
			if ( has_post_thumbnail( $post_id ) ) {
				echo get_the_post_thumbnail(
					$post_id,
					array( 60, 60 ),
					array(
						'style' => 'width:60px;height:60px;object-fit:cover;border-radius:4px;',
					)
				);
			} else {
				echo '<span style="color:#b32d2e;font-weight:600">' . esc_html__( 'Falta', 'up10-core' ) . '</span>';
			}
			break;

		case 'up10_seccion':
			$categories = get_the_category( $post_id );
			echo $categories ? esc_html( $categories[0]->name ) : '—';
			break;

		case 'up10_formato':
			$terms = wp_get_post_terms( $post_id, 'tipo_contenido', array( 'fields' => 'names' ) );
			echo ! is_wp_error( $terms ) && ! empty( $terms ) ? esc_html( $terms[0] ) : '—';
			break;

		case 'up10_breaking':
			if ( has_term( 'ultima-hora', 'senal', $post_id ) ) {
				echo '<span style="display:inline-block;padding:2px 6px;border-radius:3px;background:#b32d2e;color:#fff;font-size:11px;font-weight:600">' . esc_html__( 'Sí', 'up10-core' ) . '</span>';
			} else {
				echo '—';
			}
			break;
	}
}
add_action( 'manage_posts_custom_column', 'up10_posts_custom_column', 10, 2 );

/**
 * Checklist antes de publicar.
 */
function up10_add_publish_checklist_meta_box() {
	add_meta_box(
		'up10_publish_checklist',
		__( 'Antes de publicar', 'up10-core' ),
		'up10_publish_checklist_meta_box',
		'post',
		'side',
		'default'
	);
}
add_action( 'add_meta_boxes_post', 'up10_add_publish_checklist_meta_box' );

/**
 * Renderiza el checklist.
 *
 * @param WP_Post $post Post actual.
 */
function up10_publish_checklist_meta_box( $post ) {
	$categories  = wp_get_post_categories( $post->ID );
	$section     = $categories ? get_term( $categories[0], 'category' ) : null;
	$section_ok  = $section && ! is_wp_error( $section ) && ! in_array( $section->slug, array( 'sin-categoria', 'uncategorized' ), true ) && 1 === count( $categories );
	$tipos       = wp_get_post_terms( $post->ID, 'tipo_contenido', array( 'fields' => 'ids' ) );

	$checks = array(
		array(
			'ok'    => '' !== trim( (string) $post->post_title ),
			'label' => __( 'Titular', 'up10-core' ),
			'hint'  => __( 'Escribe el título de la nota.', 'up10-core' ),
		),
		array(
			'ok'    => '' !== trim( wp_strip_all_tags( (string) $post->post_content ) ),
			'label' => __( 'Contenido', 'up10-core' ),
			'hint'  => __( 'El cuerpo de la nota no puede estar vacío.', 'up10-core' ),
		),
		array(
			'ok'    => has_post_thumbnail( $post->ID ),
			'label' => __( 'Imagen principal', 'up10-core' ),
			'hint'  => __( 'Sin imagen principal la nota no aparece en el sitio.', 'up10-core' ),
		),
		array(
			'ok'    => $section_ok,
			'label' => __( 'Sección', 'up10-core' ),
			'hint'  => __( 'Elige exactamente una sección.', 'up10-core' ),
		),
		array(
			'ok'    => ! is_wp_error( $tipos ),
			'label' => __( 'Formato', 'up10-core' ),
			'hint'  => __( 'Por defecto: Noticia. Si la sección es Entrevistas, se marca sola.', 'up10-core' ),
		),
	);

	echo '<ul style="margin:0;padding:0;list-style:none">';

	foreach ( $checks as $check ) {
		$color = $check['ok'] ? '#1e7b3c' : '#b32d2e';
		$icon  = $check['ok'] ? '✓' : '✗';

		echo '<li style="margin:0 0 10px;color:' . esc_attr( $color ) . '">';
		echo '<strong>' . esc_html( $icon . ' ' . $check['label'] ) . '</strong>';
		echo '<br><span style="color:#646970;font-size:12px">' . esc_html( $check['hint'] ) . '</span>';
		echo '</li>';
	}

	echo '</ul>';

	$dek = up10_field( 'dek', $post->ID, '' );

	echo '<p style="margin:12px 0 0;font-size:12px;color:#646970">';
	echo $dek
		? esc_html__( 'Bajada: manual.', 'up10-core' )
		: esc_html__( 'Bajada: automática desde el primer párrafo.', 'up10-core' );
	echo '</p>';
}

/**
 * Encola el script del editor de bloques.
 */
function up10_enqueue_editor_assets() {
	wp_enqueue_script(
		'up10-editor',
		UP10_CORE_URL . 'assets/editor.js',
		array( 'wp-dom-ready', 'wp-data', 'wp-edit-post' ),
		UP10_CORE_VERSION,
		true
	);
}
add_action( 'enqueue_block_editor_assets', 'up10_enqueue_editor_assets' );

/**
 * Widget de ayuda en el escritorio.
 */
function up10_register_dashboard_widget() {
	wp_add_dashboard_widget(
		'up10_help',
		__( 'Cómo publicar en UP10', 'up10-core' ),
		'up10_dashboard_help_widget'
	);
}
add_action( 'wp_dashboard_setup', 'up10_register_dashboard_widget' );

/**
 * Contenido del widget de ayuda.
 */
function up10_dashboard_help_widget() {
	?>
	<p><strong><?php esc_html_e( 'Flujo simple', 'up10-core' ); ?></strong></p>
	<ol style="margin-left:18px">
		<li><?php esc_html_e( 'Escribe el titular y el contenido. El primer párrafo será la bajada.', 'up10-core' ); ?></li>
		<li><?php esc_html_e( 'Sube una imagen principal (obligatoria).', 'up10-core' ); ?></li>
		<li><?php esc_html_e( 'Elige la sección y el formato. Si la sección es Entrevistas, el formato se marca solo.', 'up10-core' ); ?></li>
		<li><?php esc_html_e( 'Marca Última hora solo si corresponde y publica.', 'up10-core' ); ?></li>
	</ol>
	<p>
		<a class="button button-primary" href="<?php echo esc_url( admin_url( 'post-new.php' ) ); ?>">
			<?php esc_html_e( 'Crear una nota', 'up10-core' ); ?>
		</a>
	</p>
	<p style="font-size:12px;color:#646970">
		<?php esc_html_e( 'La bajada manual, la galería, los relacionados y el SEO son opcionales. El SEO se genera automáticamente desde el titular, la bajada y la imagen principal.', 'up10-core' ); ?>
	</p>
	<?php
}
