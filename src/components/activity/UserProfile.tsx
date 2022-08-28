import type { Activity, DiscordUser } from 'use-lanyard';

import styles from './UserProfile.module.css';

export interface Props {
	user: DiscordUser,
	customStatus?: Activity | null,
}

export default function UserProfile({ user, customStatus }: Props) {
	return (
		<div className={styles.userProfileContainer}>
			<img className={styles.avatar} src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} />
			<div className={styles.profileInfo}>
				<span>{user.username}#{user.discriminator}</span>
				{customStatus && <CustomStatus activity={customStatus} />}
			</div>
		</div>
	)
}

export function CustomStatus({ activity }: { activity: Activity }) {
	return (
		<div className={styles.customStatusContainer}>
			{activity.emoji &&
				(activity.emoji.id ?
					<img
						className={styles.customStatusImage}
						src={`https://cdn.discordapp.com/emojis/${activity.emoji.id}.png`}
						alt={activity.emoji.name}
					/> :
					<span className={styles.customStatusImage}>{activity.emoji.name}</span>)
			}
			<p className={styles.customStatusText}>{activity.state}</p>
		</div>
	)
}
