import type { GatewayActivity } from "discord-api-types/v10";
import { Duration } from "luxon";
import { lazy, Suspense, useEffect, useState } from "react";
import { DialogTrigger } from "react-aria-components";
import FloatingCard from "../FloatingCard";
import Pill from "./Pill";

const TidalCard = lazy(async () => import("./TidalCard"));

export type TidalPillProps = {
	readonly activity: GatewayActivity;
};

type TidalPillInnerProps = {
	readonly activity: GatewayActivity;
	readonly duration: number;
};

function TidalPillInner({ activity, duration }: TidalPillInnerProps) {
	const calcMs = () => Date.now() - activity.timestamps!.start!;
	const [ms, setMs] = useState(calcMs());
	const progress = Math.min(ms / duration, 1);

	useEffect(() => {
		setMs(calcMs());
		const interval = setInterval(() => setMs(calcMs()), 1_000);
		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activity.timestamps]);

	return (
		<DialogTrigger>
			<Pill progress={progress}>
				<span className="text-2xl icon-[simple-icons--tidal]" />
				<span className="w-full truncate">
					<span>{activity.details}</span>
					<span className="font-light text-sm"> &mdash; {activity.state}</span>
				</span>
			</Pill>

			<FloatingCard>
				<Suspense>
					<TidalCard
						artist={activity.state!}
						duration={Duration.fromMillis(ms)}
						largeImage={activity.assets?.large_image}
						title={activity.details!}
						total={Duration.fromMillis(duration)}
					/>
				</Suspense>
			</FloatingCard>
		</DialogTrigger>
	);
}

export default function TidalPill({ activity }: TidalPillProps) {
	if (!activity.timestamps?.end || !activity.timestamps?.start) return null;

	const duration = activity.timestamps.end - activity.timestamps.start;
	return <TidalPillInner activity={activity} duration={duration} />;
}
