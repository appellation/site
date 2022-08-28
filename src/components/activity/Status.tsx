import { lazy, PropsWithChildren, Suspense, useState } from 'react';
import { Activity, Spotify, useLanyardWs } from 'use-lanyard';

import styles from './Status.module.css';
import CustomStatus from './CustomStatus';
import StatusIcon from './StatusIcon';

const SpotifyComponent = lazy(() => import('./Spotify'));

const DISCORD_ID = '618570414855028767';

interface ActivityProps {
	short: Activity;
	activities: Activity[];
	spotify: Spotify | null;
}

const statuses: Record<string, string> = {
	online: 'Online',
	idle: 'Idle',
	dnd: 'Do not disturb',
	offline: 'Offline',
};

export default function Status(): JSX.Element {
	const activity = useLanyardWs(DISCORD_ID);
	if (!activity) return <div>Loading</div>;
	console.log(activity);

	const activities = activity.activities.sort((a, b) => a.type - b.type);
	return (
		<div className={styles.container}>
			<StatusIcon status={activity.discord_status} />
			{activities[0]
				? <ShortActivity short={activities[0]} activities={activities} spotify={activity.spotify} />
				: <p>{statuses[activity.discord_status] ?? 'Unknown'}</p>
			}
		</div>
	);
}

const activityTexts = [
	'Playing',
	'Streaming',
	'Listening to',
	'Watching',
	null,
	'Competing in',
];

function ShortActivity({ short, spotify, activities }: ActivityProps) {
	let statusText = activityTexts[short.type];

	let shortText;
	switch (short.type) {
		case 1:
			shortText = short.details;
			break;
		case 0:
		case 2:
		case 3:
		case 5:
			shortText = short.name;
			break;
		case 4: return <CustomStatus activity={short} />;
		default: return <span>Unknown</span>;
	}

	return (
		<span>
			<StatusText>{statusText}</StatusText>&nbsp;
			<ActivityText activities={activities} spotify={spotify}>{shortText}</ActivityText>
		</span>
	);
}

function StatusText({ children }: PropsWithChildren) {
	return <span className={styles.statusText}>{children}</span>;
}

function ActivityText({ children, activities, spotify }: PropsWithChildren<Omit<ActivityProps, 'short'>>) {
	const [isVisible, setIsVisible] = useState(false);
	return (
		<span
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
		>
			<span className={styles.activityText}>{children}</span>
			{isVisible && <ActivityTooltip activities={activities} spotify={spotify} />}
		</span>
	);
}

function ActivityTooltip({ spotify, activities }: Omit<ActivityProps, 'short'>) {
	return (
		<div className={styles.tooltipContainer}>
			<div className={styles.activityTooltip}>
				{activities.map(a => {
					switch (a.type) {
						case 2: return null;
						case 4: return <CustomStatus activity={a} />
						default: return <div>{a.name}</div>
					}
				})}
				<Suspense fallback={<p>Loading</p>}>
					<SpotifyComponent activity={spotify} />
				</Suspense>
			</div>
		</div>
	);
}
