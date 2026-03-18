export type SpotifyEmbedProps = {
	readonly trackId: string;
};

export default function SpotifyEmbed(props: SpotifyEmbedProps) {
	return (
		<iframe
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			className="w-full h-20"
			sandbox="allow-scripts allow-forms allow-popups"
			src={`https://open.spotify.com/embed/track/${props.trackId}`}
		/>
	);
}
