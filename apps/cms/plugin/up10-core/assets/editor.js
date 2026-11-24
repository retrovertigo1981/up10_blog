( function ( wp ) {
	if ( ! wp || ! wp.domReady ) {
		return;
	}

	wp.domReady( function () {
		if ( ! wp.data || ! wp.data.dispatch ) {
			return;
		}

		var dispatch = wp.data.dispatch( 'core/edit-post' );

		if ( ! dispatch || ! dispatch.removeEditorPanel ) {
			return;
		}

		[
			'taxonomy-panel-category',
			'taxonomy-panel-post_tag',
			'taxonomy-panel-tipo_contenido',
			'taxonomy-panel-senal',
			'post-excerpt',
		].forEach( function ( panel ) {
			try {
				dispatch.removeEditorPanel( panel );
			} catch ( error ) {
				// El panel puede no existir en esta versión del editor.
				void error;
			}
		} );
	} );
} )( window.wp );
