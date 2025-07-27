import type { GatewayActivity } from 'discord-api-types/v10'
import { createEffect, createSignal, onCleanup } from 'solid-js';
import Pill from './Pill';

export type TidalPillProps = {
	activity: GatewayActivity;
}

export default function TidalPill(props: TidalPillProps) {
	const duration = () =>
		props.activity.timestamps!.end! - props.activity.timestamps!.start!;
	const calcSeconds = () => Date.now() - props.activity.timestamps!.start!;

	// eslint-disable-next-line solid/reactivity
	const [seconds, setSeconds] = createSignal(calcSeconds());
	const progress = () => Math.min(seconds() / duration(), 1);

	const interval = setInterval(() => setSeconds(calcSeconds()), 1_000);
	onCleanup(() => clearInterval(interval));

	createEffect(() => setSeconds(calcSeconds()));

	return (
		<div class="relative">
			<Pill progress={progress()}>
				<span class="text-2xl i-simple-icons-tidal" />
				<span class="w-full truncate">
					<span>{props.activity.details}</span>
					<span class="font-light text-sm"> &mdash; {props.activity.state}</span>
				</span>
			</Pill>
		</div>
	);}
