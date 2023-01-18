import { Motion, Presence } from '@motionone/solid';
import type { GatewayActivity } from 'discord-api-types/v10';
import { Show } from 'solid-js';

function makeAssetUrl(appId: string, assetId: string): string {
	return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`;
}

export interface Props {
	activity: GatewayActivity;
}

export default function Game(props: Props) {
	return (
		<div class='flex items-start bg-white dark:bg-black rounded-lg p-2'>
			<Show when={props.activity.application_id && props.activity.assets?.large_image}>
				<div class='mr-2 relative'>
					<img class='rounded h-18 w-18' src={makeAssetUrl(props.activity.application_id!, props.activity.assets!.large_image!)} />
					<Show when={props.activity.assets?.small_image}>
						<img class='absolute bottom-[-0.25rem] right-[-0.25rem] h-6 w-6 rounded-full border-3 border-white dark:border-black' src={makeAssetUrl(props.activity.application_id!, props.activity.assets!.small_image!)} />
					</Show>
				</div>
			</Show>
			<div class='flex flex-col'>
				<span class='font-bold'>{props.activity.name}</span>
				<Presence>
					<Show when={props.activity.details} keyed>
						<div class='relative'>
							<Motion.span
								initial={{ x: 25, opacity: 0 }}
								animate={{ x: 0, opacity: 1, transition: { delay: 0.05 } }}
								exit={{ x: -25, opacity: 0 }}
								transition={{ duration: 0.15 }}
								class='absolute'
							>
								{props.activity.details}
							</Motion.span>
						</div>
					</Show>
					<Show when={props.activity.state}>
						<div class='relative'>
							<Motion.span
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1, transition: { delay: 0.05 } }}
								exit={{ x: -20, opacity: 0 }}
								transition={{ duration: 0.3 }}
								class='absolute'
							>
								{props.activity.state}
							</Motion.span>
						</div>
					</Show>
				</Presence>
			</div>
		</div>
	);
}
