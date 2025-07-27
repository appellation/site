import type { GatewayActivity } from "discord-api-types/v10";
import { useMemo, useRef } from "react";
import DismissibleCard from "../DismissibleCard";
import Pill from "./Pill";
import { DialogTrigger } from "react-aria-components";
import type { Types } from "use-lanyard";

export type StatusPillProps = {
	readonly customStatus?: GatewayActivity;
	readonly status?: string;
	readonly user: Types.DiscordUser;
};

export default function StatusPill({ status, user }: StatusPillProps) {
	const statusClass = useMemo(() => {
		switch (status) {
			case "online":
				return "i-mdi-circle text-2xl text-green-500";
			case "idle":
				return "i-mdi-moon-waxing-crescent text-2xl text-yellow-500";
			case "dnd":
				return "i-mdi-minus-circle text-2xl text-red-500";
			case "offline":
				return "i-mdi-record-circle text-2xl";
		}
	}, [status]);

	return (
		<DialogTrigger>
			<Pill>
				<span className={statusClass} />
				<p className="w-full truncate">{status}</p>
			</Pill>
			<DismissibleCard>
				<div>
					<img
						className="rounded-full w-6 h-6 inline-block mr-2"
						src={`https://api.lanyard.rest/${user.id}.png`}
					/>
					<div className="inline-block">
						<span>{user.username}</span>
					</div>
				</div>
			</DismissibleCard>
		</DialogTrigger>
	);
}
