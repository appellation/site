import type { GatewayActivity } from 'discord-api-types/v10';
import { createSignal, Match, onMount, Switch } from 'solid-js';

export interface Props {
	activity: GatewayActivity;
}

export default function CustomStatus(props: Props) {
	const [imgRef, setImgRef] = createSignal<HTMLImageElement>();
	const extension = () => props.activity.emoji?.animated ? 'gif' : 'png';
	const [size, setSize] = createSignal<number>();

	onMount(() => {
		const el = imgRef();
		let fontSize = el && getComputedStyle(el).fontSize;
		fontSize = fontSize?.slice(0, fontSize.length - 2);
		setSize(fontSize ? Math.max(parseFloat(fontSize), 16) : 16);
	});

	return (
		<>
			<Switch fallback={<></>}>
				<Match when={props.activity.emoji?.id}>
					<img ref={setImgRef} class='h-4 inline mr-1' src={`https://cdn.discordapp.com/emojis/${props.activity.emoji!.id}.${extension()}?size=${size()}`} />
				</Match>
				<Match when={props.activity.emoji?.name}>
					<span class='mr-1'>{props.activity.emoji!.name}</span>
				</Match>
			</Switch>
			<span>{props.activity.state}</span>
		</>
	);
}
