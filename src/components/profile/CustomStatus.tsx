import type { GatewayActivity } from 'discord-api-types/v10';
import { Match, Switch } from 'solid-js';

export interface Props {
	activity: GatewayActivity;
}

export default function CustomStatus(props: Props) {
	return (
		<>
			<Switch fallback={<></>}>
				<Match when={props.activity.emoji?.id}>
					<img class='h-4 inline mr-1' src={`https://cdn.discordapp.com/emojis/${props.activity.emoji!.id}.png`} />
				</Match>
				<Match when={props.activity.emoji?.name}>
					<span class='mr-1'>{props.activity.emoji!.name}</span>
				</Match>
			</Switch>
			<span>{props.activity.state}</span>
		</>
	);
}
