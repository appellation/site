import type { GatewayActivity } from "discord-api-types/v10";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Pill from "./Pill";
import FloatingCard from "../FloatingCard";
import { DialogTrigger } from "react-aria-components";
import { Duration } from "luxon";
import { animate, splitText } from "animejs";
import type { TextSplitter } from "animejs";

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

			<TidalCard
				largeImage={activity.assets?.large_image}
				title={activity.details!}
				artist={activity.state!}
				duration={Duration.fromMillis(ms)}
				total={Duration.fromMillis(duration)}
			/>
		</DialogTrigger>
	);
}

function AnimatedDuration({ duration }: { duration: Duration }) {
	const containerRef = useRef<HTMLSpanElement>(null);
	const splitterRef = useRef<TextSplitter | null>(null);
	const accessibleRef = useRef<HTMLElement | null>(null);

	const formatted = duration.toFormat("mm:ss");

	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.textContent = formatted;
		splitterRef.current = splitText(el, {
			chars: { clone: "bottom", wrap: true },
		});
		accessibleRef.current = el.firstChild as HTMLElement;
	}, []);

	useEffect(() => {
		const splitter = splitterRef.current;
		if (!splitter) return;

		if (accessibleRef.current) accessibleRef.current.textContent = formatted;

		const changed = splitter.chars.filter((charEl: HTMLElement, i: number) => {
			const newChar = formatted[i];
			if ((charEl.children[0] as HTMLElement).textContent === newChar)
				return false;
			(charEl.children[1] as HTMLElement).textContent = newChar;
			return true;
		});

		if (!changed.length) return;

		animate(changed, {
			translateY: ["0%", "-100%"],
			duration: 250,
			ease: "outExpo",
			onComplete: () => {
				for (const charEl of changed as HTMLElement[]) {
					(charEl.children[0] as HTMLElement).textContent =
						formatted[splitter.chars.indexOf(charEl)];
					charEl.style.transform = "translateY(0%)";
				}
			},
		});
	}, [formatted]);

	return <span ref={containerRef} />;
}

function TidalCard({
	largeImage,
	title,
	artist,
	duration,
	total,
}: {
	largeImage?: string;
	title: string;
	artist: string;
	duration: Duration;
	total: Duration;
}) {
	const largeImageUrl = `https://media.discordapp.net/${largeImage?.slice(3)}`;

	return (
		<FloatingCard>
			<img src={largeImageUrl} className="w-16 h-16 rounded" />
			<div>
				<p className="text-lg/4 font-bold">{title}</p>
				<p>{artist}</p>
				<p className="text-sm/4 font-light font-mono tracking-tight">
					<AnimatedDuration duration={duration} /> - {total.toFormat("mm:ss")}
				</p>
			</div>
		</FloatingCard>
	);
}
