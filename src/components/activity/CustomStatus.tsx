import type { Activity } from 'use-lanyard';

import styles from './CustomStatus.module.css';

export default function CustomStatus({ activity }: { activity: Activity }) {
	return (
		<div className={styles.container}>
			{activity.emoji &&
				(activity.emoji.id ?
					<img
						className={styles.image}
						src={`https://cdn.discordapp.com/emojis/${activity.emoji.id}.png`}
						alt={activity.emoji.name}
					/> :
					<span className={styles.image}>{activity.emoji.name}</span>)
			}
			<p className={styles.text}>{activity.state}</p>
		</div>
	)
}
