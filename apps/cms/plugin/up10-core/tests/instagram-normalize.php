<?php

define( 'ABSPATH', __DIR__ . '/' );

function add_filter() {}
function add_action() {}
function __( $text, $domain = null ) {
	unset( $domain );
	return $text;
}

require_once dirname( __DIR__ ) . '/includes/instagram.php';

$fixture = json_decode( file_get_contents( __DIR__ . '/fixtures/instagram/media.json' ), true );

if ( ! is_array( $fixture ) ) {
	throw new RuntimeException( 'No se pudo leer el fixture de Instagram.' );
}

$expected = array(
	'image-1'       => array( 'image', 'https://scontent.cdninstagram.com/image-1.jpg' ),
	'carousel-1'    => array( 'carousel', 'https://scontent.cdninstagram.com/carousel-video.jpg' ),
	'video-1'       => array( 'video', 'https://scontent.cdninstagram.com/video-1.jpg' ),
	'no-caption-1'  => array( 'image', 'https://scontent.cdninstagram.com/no-caption.jpg' ),
	'unsupported-1' => null,
);

foreach ( $fixture as $item ) {
	$normalized = up10_instagram_normalize( $item );
	$id         = $item['id'];

	if ( null === $expected[ $id ] ) {
		if ( null !== $normalized ) {
			throw new RuntimeException( 'Se aceptó un tipo de publicación no soportado.' );
		}
		continue;
	}

	if (
		! is_array( $normalized )
		|| $expected[ $id ][0] !== $normalized['type']
		|| $expected[ $id ][1] !== $normalized['media_url']
		|| $id !== $normalized['id']
	) {
		throw new RuntimeException( 'La normalización no coincide para ' . $id . '.' );
	}

	if ( 'no-caption-1' === $id && '' !== $normalized['caption'] ) {
		throw new RuntimeException( 'Se inventó un caption para una publicación sin texto.' );
	}
}

if ( 'Hola' !== up10_instagram_alt_text( 'Hola' ) ) {
	throw new RuntimeException( 'El alt no conservó el caption.' );
}

if ( 'Publicación de Instagram de UP10' !== up10_instagram_alt_text( '' ) ) {
	throw new RuntimeException( 'El alt no usó el respaldo para un caption vacío.' );
}

if ( 'Publicación de Instagram de UP10' !== up10_instagram_alt_text( '   ' ) ) {
	throw new RuntimeException( 'El alt no usó el respaldo para un caption en blanco.' );
}

echo "Normalización de Instagram: OK\n";
