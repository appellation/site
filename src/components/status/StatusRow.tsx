import { Index, type JSX, Show } from "solid-js";
import useLanyard, { type Presence } from "../lanyard/useLanyard";
import { USER_ID } from "../util/constants";
import ActivityPill from "./ActivityPill";
import SpotifyPill from "./SpotifyPill";
import StatusPill from "./StatusPill";
import CurrentTime from "./CurrentTime";

export default function StatusRow(props: {
	initialPresence: Presence;
}): JSX.Element {
	const presence = useLanyard(USER_ID, props.initialPresence);
	const customStatus = () => presence.activities?.find((a) => a.type === 4);
	const activities = () =>
		presence.activities?.filter((a) => a.type === 0) ?? [];

	return (
		<div class="flex gap-2 flex-wrap">
			<CurrentTime />
			<StatusPill
				customStatus={customStatus()}
				status={presence.discord_status}
				user={presence.discord_user}
			/>
			<Show when={presence.spotify} keyed>
				{(spotify) => <SpotifyPill info={spotify} />}
			</Show>
			<Index each={activities()}>
				{(item) => <ActivityPill activity={item()} />}
			</Index>
		</div>
	);
}
