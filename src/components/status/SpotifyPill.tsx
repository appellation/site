import { createSignal, onCleanup } from 'solid-js';
import type { Spotify } from '../lanyard/useLanyard';
import Pill from './Pill';

export interface SpotifyPillProps {
	info: Spotify,
}

export default function SpotifyPill(props: SpotifyPillProps) {
	const getProgress = () => {
		const now = Date.now();
		const duration = props.info.timestamps.end - props.info.timestamps.start;
		return Math.min((now - props.info.timestamps.start) / duration, 1);
	};

	const [progress, setProgress] = createSignal(getProgress());

	const interval = setInterval(() => setProgress(getProgress()),);
	onCleanup(() => clearInterval(interval));

	return <Pill
		text={`${props.info.song} - ${props.info.artist}`}
		link={`https://open.spotify.com/track/${props.info.track_id}`}
		progress={progress()}
	>
		<div class='text-xl i-fa-brands-spotify text-[#1DB954]' />
	</Pill>;
}
