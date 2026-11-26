<?php

define( 'ABSPATH', __DIR__ . '/' );

function add_filter() {}
function add_action() {}

require_once dirname( __DIR__ ) . '/includes/instagram.php';

$fixture = json_decode( file_get_contents( __DIR__ . '/fixtures/instagram/media.json' ), true );

if ( ! is_array( $fixture ) ) {
	throw new RuntimeException( 'No se pudo leer el fixture de Instagram.' );
}

$expected = array(
	'image-1'       => array( 'image', 'https://scontent.cdninstagram.com/image-1.jpg' ),
	'carousel-1'    => array( 'carousel', 'https://scontent.cdninstagram.com/carousel-video.jpg' ),
	'video-1'       => array( 'video', 'https://scontent.cdninstagram.com/video-1.jpg' ),
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
}

echo "Normalización de Instagram: OK\n";
