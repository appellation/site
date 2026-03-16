import { useEffect, useLayoutEffect, useRef } from "react";
import FloatingCard from "../FloatingCard";
import type { Duration } from "luxon";
import { animate, splitText } from "animejs";
import type { TextSplitter } from "animejs";
import { VisuallyHidden } from "react-aria-components";

function AnimatedDuration({ duration }: { duration: Duration }) {
	const containerRef = useRef<HTMLSpanElement>(null);
	const splitterRef = useRef<TextSplitter | null>(null);

	const formatted = duration.toFormat("mm:ss");

	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.textContent = formatted;
		splitterRef.current = splitText(el, {
			chars: { clone: "bottom", wrap: true },
			accessible: false,
		});
	}, []);

	useEffect(() => {
		const splitter = splitterRef.current;
		if (!splitter) return;

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

	return (
		<>
			<span aria-hidden ref={containerRef} />
			<VisuallyHidden elementType="span">{formatted}</VisuallyHidden>
		</>
	);
}

export default function TidalCard({
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
