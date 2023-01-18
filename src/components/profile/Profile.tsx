import { For, JSX, Show } from 'solid-js';

import useLanyard from '../lanyard/useLanyard';
import Game from './Game';
import Spotify from './Spotify';

const USER_ID = '618570414855028767';

export default function Profile(): JSX.Element {
	const presence = useLanyard(USER_ID);

	return (
		<Show when={presence()}>
			<Show when={presence()!.listening_to_spotify}>
				<Spotify spotify={presence()!.spotify!} />
			</Show>
			<For each={presence()!.activities}>
				{(item, index) => {
					switch (item.type) {
						case 0:
							return <Game activity={item} />
						default:
							return <></>;
					}
				}}
			</For>
		</Show>
	);
}
