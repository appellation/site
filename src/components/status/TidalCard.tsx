import { animate, stagger, splitText } from "animejs";
import type { TextSplitter } from "animejs";
import type { Duration } from "luxon";
import { useEffect, useLayoutEffect, useRef } from "react";
import { VisuallyHidden } from "react-aria-components";

function AnimatedDuration({ duration }: { readonly duration: Duration }) {
	const containerRef = useRef<HTMLSpanElement>(null);
	const splitterRef = useRef<TextSplitter | null>(null);

	const formatted = duration.toFormat("mm:ss");

	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.textContent = formatted;
		const splitter = splitText(el, {
			chars: { clone: "bottom", wrap: "clip", class: "ticker-char" },
			accessible: false,
		});

		splitter.addEffect(() =>
			animate(splitter.chars, {
				opacity: [0, 1],
				translateY: ["100%", "0%"],
				delay: stagger(30, { from: "center" }),
				duration: 600,
				ease: "outElastic(1, .6)",
			}),
		);

		splitterRef.current = splitter;
		return () => {
			splitter.revert();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const splitter = splitterRef.current;
		if (!splitter) return;

		const changed = splitter.chars.filter(
			(charEl: HTMLElement, idx: number) => {
				const newChar = formatted[idx];
				if ((charEl.children[0] as HTMLElement).textContent === newChar)
					return false;
				(charEl.children[1] as HTMLElement).textContent = newChar;
				return true;
			},
		);

		if (!changed.length) return;

		animate(changed, {
			translateY: [
				{ to: "-50%", duration: 100, ease: "inQuad" },
				{ to: "-100%", duration: 200, ease: "outBack(2)" },
			],
			composition: "replace",
			delay: stagger(25, { from: "last" }),
			onComplete: ({ targets }) => {
				for (const charEl of targets) {
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
	readonly artist: string;
	readonly duration: Duration;
	readonly largeImage?: string;
	readonly title: string;
	readonly total: Duration;
}) {
	const largeImageUrl = `https://media.discordapp.net/${largeImage?.slice(3)}`;

	return (
		<>
			<img className="w-16 h-16 rounded" src={largeImageUrl} />
			<div>
				<p className="text-lg/4 font-bold">{title}</p>
				<p>{artist}</p>
				<p className="text-sm/4 font-light font-mono tracking-tight">
					<AnimatedDuration duration={duration} /> - {total.toFormat("mm:ss")}
				</p>
			</div>
		</>
	);
}
