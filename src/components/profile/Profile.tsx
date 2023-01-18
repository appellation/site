import { Presence } from '@motionone/solid';
import { isEqual } from 'lodash-es';
import { createMemo, For, Index, JSX, Show } from 'solid-js';

import useLanyard from '../lanyard/useLanyard';
import Game from './Game';
import Spotify from './Spotify';

const USER_ID = '618570414855028767';

export default function Profile(): JSX.Element {
	const presence = useLanyard(USER_ID);
	const spotify = createMemo(() => presence()?.spotify, undefined, { equals: isEqual });
	const activities = createMemo(() => presence()?.activities?.filter(a => a.type === 0), undefined, { equals: isEqual });

	return (
		<Show when={presence()}>
			<div class='flex flex-col gap-2'>
				<Presence exitBeforeEnter>
					<Show when={spotify()} keyed>
						<Spotify spotify={spotify()!} />
					</Show>
				</Presence>
				<Index each={activities()}>
					{(item) => <Game activity={item()} />}
				</Index>
			</div>
		</Show>
	);
}
