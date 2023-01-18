import { Index, JSX, Show } from 'solid-js';

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
			<Index each={presence()!.activities}>
				{(item) => {
					switch (item().type) {
						case 0:
							return <Game activity={item()} />
						default:
							return <></>;
					}
				}}
			</Index>
		</Show>
	);
}
