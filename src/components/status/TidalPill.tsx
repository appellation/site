import type { GatewayActivity } from "discord-api-types/v10";
import { useEffect, useState } from "react";
import Pill from "./Pill";

export type TidalPillProps = {
	readonly activity: GatewayActivity;
};

export default function TidalPill(props: TidalPillProps) {
	const duration =
		props.activity.timestamps!.end! - props.activity.timestamps!.start!;
	const calcSeconds = () => Date.now() - props.activity.timestamps!.start!;

	const [seconds, setSeconds] = useState(calcSeconds());
	const progress = Math.min(seconds / duration, 1);

	useEffect(() => {
		const interval = setInterval(() => setSeconds(calcSeconds()), 1_000);
		return () => clearInterval(interval);
	});

	return (
		<div className="relative">
			<Pill progress={progress}>
				<span className="text-2xl i-simple-icons-tidal" />
				<span className="w-full truncate">
					<span>{props.activity.details}</span>
					<span className="font-light text-sm">
						{" "}
						&mdash; {props.activity.state}
					</span>
				</span>
			</Pill>
		</div>
	);
}
