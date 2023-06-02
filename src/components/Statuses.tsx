import { createMemo, Index, JSX, Show } from "solid-js";

import useLanyard from "./lanyard/useLanyard";
import ActivityPill from "./status/ActivityPill";
import SpotifyPill from "./status/SpotifyPill";
import StatusPill from "./status/StatusPill";
import Pill from "./status/Pill";

const USER_ID = "618570414855028767";

function Fallback() {
	return (
		<Pill>
			<div class="i-mdi-loading text-2xl animate-spin" /> loading
		</Pill>
	);
}

export default function Statuses(): JSX.Element {
	const presence = useLanyard(USER_ID);
	const customStatus = createMemo(() =>
		presence.activities?.find((a) => a.type === 4)
	);
	const activities = createMemo(
		() => presence.activities?.filter((a) => a.type === 0) ?? []
	);

	return (
		<Show when={Object.keys(presence).length > 0} fallback={Fallback}>
			<div class="flex gap-2 flex-wrap">
				<Show when={presence.discord_status && presence.discord_user}>
					<StatusPill
						customStatus={customStatus()}
						status={presence.discord_status!}
						user={presence.discord_user!}
					/>
				</Show>
				<Show when={presence.spotify} keyed>
					{(spotify) => <SpotifyPill info={spotify} />}
				</Show>
				<Index each={activities()}>
					{(item) => <ActivityPill activity={item()} />}
				</Index>
			</div>
		</Show>
	);
}
