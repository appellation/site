import type { GatewayActivity } from "discord-api-types/v10";
import { lazy, Suspense, useEffect, useState } from "react";
import Pill from "./Pill";
import { DialogTrigger } from "react-aria-components";
import { Duration } from "luxon";

const TidalCard = lazy(() => import("./TidalCard"));

export type TidalPillProps = {
	readonly activity: GatewayActivity;
};

export default function TidalPill({ activity }: TidalPillProps) {
	if (!activity.timestamps?.end || !activity.timestamps?.start) return null;

	const duration = activity.timestamps.end - activity.timestamps.start;
	const calcMs = () => Date.now() - activity.timestamps!.start!;

	const [ms, setMs] = useState(calcMs());
	const progress = Math.min(ms / duration, 1);

	useEffect(() => {
		setMs(calcMs());
		const interval = setInterval(() => setMs(calcMs()), 1_000);
		return () => clearInterval(interval);
	}, [activity.timestamps]);

	activity.assets?.large_image;
	return (
		<DialogTrigger>
			<Pill progress={progress}>
				<span className="text-2xl i-simple-icons-tidal" />
				<span className="w-full truncate">
					<span>{activity.details}</span>
					<span className="font-light text-sm"> &mdash; {activity.state}</span>
				</span>
			</Pill>

			<Suspense>
				<TidalCard
					largeImage={activity.assets?.large_image}
					title={activity.details!}
					artist={activity.state!}
					duration={Duration.fromMillis(ms)}
					total={Duration.fromMillis(duration)}
				/>
			</Suspense>
		</DialogTrigger>
	);
}
