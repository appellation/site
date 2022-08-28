import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import type { Spotify } from 'use-lanyard';

import styles from './Spotify.module.css';


export default function Spotify({ activity }: { activity: Spotify | null | undefined }) {
	if (!activity) return null;

	return (
		<a className={styles.container} href={`https://open.spotify.com/track/${activity.track_id}`} target="_black">
			<img className={styles.albumArt} src={activity.album_art_url} />
			<div className={styles.songInfo}>
				<h3 className={styles.songName}>{activity.song}</h3>
				<p className={styles.songArtist}>{activity.artist}</p>
				<SpotifyPlayback activity={activity} />
			</div>
			<img className={styles.logo} src='/Spotify_Icon_RGB_White.png' />
		</a>
	);
}

function SpotifyPlayback({ activity }: { activity: Spotify }) {
	const endDate = DateTime.fromMillis(activity.timestamps.end);
	const startDate = DateTime.fromMillis(activity.timestamps.start);

	const totalTime = endDate.diff(startDate);

	return (
		<div>
			{<SpotifyPlayTime start={startDate} />} - {totalTime.toFormat('m:ss')}
		</div>
	);
}

function SpotifyPlayTime({ start }: { start: DateTime }) {
	const [playTime, setPlayTime] = useState(start.diffNow());

	useEffect(() => {
		const interval = setInterval(() => setPlayTime(start.diffNow()), 1000);
		return () => clearInterval(interval);
	});

	return <>{playTime.negate().toFormat('m:ss')}</>;
}
