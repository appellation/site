export interface SpotifyEmbedProps {
	trackId: string;
	seconds(): number;
}

export default function SpotifyEmbed(props: SpotifyEmbedProps) {
	return <iframe
		class="w-full h-20"
		src={`https://open.spotify.com/embed/track/${props.trackId}`}
		allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
	/>;
}
