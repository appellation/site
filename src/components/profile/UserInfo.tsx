import type { GatewayActivity } from 'discord-api-types/v10';
import { Show } from 'solid-js';
import type { DiscordUser } from '../lanyard/useLanyard';
import CustomStatus from './CustomStatus';

export interface Props {
	user: DiscordUser;
	customStatus?: GatewayActivity;
}

export default function UserInfo(props: Props) {
	return (
		<div class='flex w-full'>
			<img class='w-12 h-12 rounded-full mr-2' src={`https://cdn.discordapp.com/avatars/${props.user.id}/${props.user.avatar}.png`} />
			<div class='w-full truncate'>
				<div class='font-medium'>{props.user.username}#{props.user.discriminator}</div>
				<Show when={props.customStatus}>
					<div class='text-sm text-slate-500'>
						<CustomStatus activity={props.customStatus!} />
					</div>
				</Show>
			</div>
		</div>
	)
}
