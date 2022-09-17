import { createMemo } from 'solid-js';
import type { Presence } from './lanyard/useLanyard';
import CustomStatus from './profile/CustomStatus';

export interface Props {
	presence: Presence;
}

const adverbs = {
	0: 'Playing',
	1: 'Streaming',
	2: 'Listening to',
	3: 'Watching',
	5: 'Competing',
};

export default function StatusText(props: Props) {
	const text = createMemo(() => {
		const first = props.presence.activities.sort((a, b) => a.type - b.type).at(0);

		switch (first?.type) {
			case 0:
			case 2:
			case 3:
			case 5:
				return <span>{adverbs[first.type]} <span class='font-bold underline decoration-dashed'>{first.name}</span></span>;
			case 1:
				return <span>{adverbs[first.type]} <span class='font-bold underline decoration-dashed'>{first.details}</span></span>;
			case 4:
				return <CustomStatus activity={first} />;
			default:
				return <span>{props.presence.discord_status}</span>;
		}
	});

	return <>{text()}</>;
}
