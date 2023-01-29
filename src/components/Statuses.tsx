import { isEqual } from 'lodash-es';
import { createEffect, createMemo, Index, JSX, Show } from 'solid-js';

import useLanyard from './lanyard/useLanyard';
import Pill from './status/Pill';
import SpotifyPill from './status/SpotifyPill';

const USER_ID = '618570414855028767';

function makeAssetUrl(appId: string, assetId: string): string {
	return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`;
}

export default function Statuses(): JSX.Element {
	const presence = useLanyard(USER_ID);
	const spotify = createMemo(() => presence()?.spotify, undefined, { equals: isEqual });
	const activities = createMemo(() => presence()?.activities?.filter(a => a.type === 0) ?? [], undefined, { equals: isEqual });

	createEffect(() => console.log(activities()));

	return (
		<Show when={presence()}>
			<div class='flex gap-2'>
				<Show when={spotify()} keyed>
					{spotify => <SpotifyPill info={spotify} />}
				</Show>
				<Index each={activities()}>
					{(item) => <Pill text={item().name}>
						<Show when={item().application_id && item().assets?.small_image}>
							<img class='h-6 w-6 rounded-full' src={makeAssetUrl(item().application_id!, item().assets!.small_image!)} />
						</Show>
					</Pill>}
				</Index>
			</div>
		</Show>
	);
}
