import { useLanyardWS, type Types } from "use-lanyard";
import { USER_ID } from "../util/constants";
import ActivityPill from "./ActivityPill";
import CurrentTime from "./CurrentTime";
import StatusPill from "./StatusPill";
import TidalPill from "./TidalPill";

export default function StatusRow({
	initialPresence,
}: {
	initialPresence: Types.Presence;
}) {
	const presence = useLanyardWS(USER_ID, { initialData: initialPresence });

	const customStatus = presence.activities?.find((a) => a.type === 4);
	const activities = presence.activities?.filter((a) => a.type === 0) ?? [];
	const tidalActivity = presence.activities.find(
		(activity) => activity.application_id === "1396900502729392188",
	);

	return (
		<div className="flex gap-2 flex-wrap">
			<CurrentTime />
			<StatusPill
				customStatus={customStatus}
				status={presence.discord_status}
				user={presence.discord_user}
			/>
			{tidalActivity ? <TidalPill activity={tidalActivity} /> : null}
			{activities.map((activity) => (
				<ActivityPill activity={activity} />
			))}
		</div>
	);
}
