import { createSignal, onCleanup } from 'solid-js';

import type { Spotify } from '../lanyard/useLanyard';

export interface Props {
	spotify: Spotify;
}

export default function Spotify(props: Props) {
	const getProgress = () => {
		const now = Date.now();
		const duration = props.spotify.timestamps.end - props.spotify.timestamps.start;
		return (now - props.spotify.timestamps.start) / duration;
	};

	const [progress, setProgress] = createSignal(getProgress());

	const interval = setInterval(() => setProgress(getProgress()), 1000);
	onCleanup(() => clearInterval(interval));

	return (
		<a class='flex bg-[#1DB954] text-white p-2 rounded-lg' href={`https://open.spotify.com/track/${props.spotify.track_id}`} target="_blank">
			<img class='w-18 h-18 rounded mr-2' src={props.spotify.album_art_url} />
			<div class='flex flex-col w-full truncate'>
				<span class='font-bold'>{props.spotify.song}</span>
				<span>{props.spotify.artist}</span>
				<div class='h-full relative'>
					<div class='absolute inset-y-0 h-1 w-full m-auto'>
						<div class='absolute inset-0 bg-white/40 rounded' />
						<div class='absolute top-0 bottom-0 left-0 bg-white/80 rounded' style={{ width: `${progress() * 100}%` }} />
					</div>
				</div>
			</div>
			<img class='w-6 h-6 ml-2' src={'/Spotify_Icon_RGB_White.png'} />
		</a>
	);
}
