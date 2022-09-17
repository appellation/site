import { createMemo, For, Show } from 'solid-js';
import type { Presence } from './lanyard/useLanyard';
import Game from './profile/Game';
import Spotify from './profile/Spotify';
import UserInfo from './profile/UserInfo';

// @unocss-include

export interface Props {
	presence: Presence;
}

export default function SmallProfile(props: Required<Props>) {
	const customStatus = createMemo(() => props.presence.activities.find(a => a.type === 4));
	return (
		<>
			<UserInfo user={props.presence.discord_user} customStatus={customStatus()} />
			<Show when={props.presence.listening_to_spotify}>
				<Spotify spotify={props.presence.spotify!} />
			</Show>
			<For each={props.presence.activities}>
				{(item, index) => {
					switch (item.type) {
						case 0:
							return <Game activity={item} />
						default:
							return <></>;
					}
				}}
			</For>
		</>
	);
}
