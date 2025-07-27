export type SpotifyEmbedProps = {
	readonly trackId: string;
};

export default function SpotifyEmbed(props: SpotifyEmbedProps) {
	return (
		<iframe
			className="w-full h-20"
			src={`https://open.spotify.com/embed/track/${props.trackId}`}
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
		/>
	);
}
