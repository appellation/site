import styles from './StatusIcon.module.css';

export interface Props {
	status: string;
}

export default function StatusIcon({ status }: Props) {
	let color;
	switch (status) {
		case 'online':
			color = '#3ba55d';
			break;
		case 'dnd':
			color = '#ed4245';
			break;
		case 'idle':
			color = '#faa81a';
			break;
		case 'offline':
			color = '#747f8d';
			break;
	}

	return <span className={styles.icon} style={{ backgroundColor: color }}></span>;
}
