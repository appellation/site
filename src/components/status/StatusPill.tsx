import type { GatewayActivity } from "discord-api-types/v10";
import Dismiss from "solid-dismiss";
import { createSignal, Match, Switch } from "solid-js";
import FloatingCard from "../FloatingCard";
import type { DiscordUser } from "../lanyard/useLanyard";
import Pill from "./Pill";

export type StatusPillProps = {
	readonly customStatus?: GatewayActivity;
	readonly status: string;
	readonly user: DiscordUser;
};

export default function StatusPill(props: StatusPillProps) {
	const [pill, setPill] = createSignal<HTMLDivElement>();
	const [cardVisible, setCardVisible] = createSignal(false);

	return (
		<div class="relative">
			<Pill ref={setPill}>
				<Switch>
					<Match when={props.status === "online"}>
						<span class="i-mdi-circle text-2xl text-green-500" />
					</Match>
					<Match when={props.status === "idle"}>
						<span class="i-mdi-moon-waxing-crescent text-2xl text-yellow-500" />
					</Match>
					<Match when={props.status === "dnd"}>
						<span class="i-mdi-minus-circle text-2xl text-red-500" />
					</Match>
					<Match when={props.status === "offline"}>
						<span class="i-mdi-record-circle text-2xl" />
					</Match>
				</Switch>
				<p class="w-full truncate">{props.status}</p>
			</Pill>
			<Dismiss menuButton={pill} open={cardVisible} setOpen={setCardVisible}>
				<FloatingCard ref={pill}>
					<div>
						<img
							class="rounded-full w-6 h-6 inline-block mr-2"
							src={`https://cdn.discordapp.com/avatars/${props.user.id}/${props.user.avatar}.png?size=32`}
						/>
						<div class="inline-block">
							<span>{props.user.username}</span>
						</div>
					</div>
				</FloatingCard>
			</Dismiss>
		</div>
	);
}
