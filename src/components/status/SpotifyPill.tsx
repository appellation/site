import Dismiss from "solid-dismiss";
import {
	createEffect,
	createSignal,
	lazy,
	onCleanup,
	Suspense,
} from "solid-js";
import FloatingCard from "../FloatingCard";
import type { Spotify } from "../lanyard/useLanyard";
import Pill from "./Pill";

export type SpotifyPillProps = {
	readonly info: Spotify;
};

const SpotifyEmbed = lazy(async () => import("../SpotifyEmbed"));

export default function SpotifyPill(props: SpotifyPillProps) {
	const duration = () =>
		props.info.timestamps.end - props.info.timestamps.start;
	const calcSeconds = () => Date.now() - props.info.timestamps.start;

	// eslint-disable-next-line solid/reactivity
	const [seconds, setSeconds] = createSignal(calcSeconds());
	const progress = () => Math.min(seconds() / duration(), 1);

	const interval = setInterval(() => setSeconds(calcSeconds()), 1_000);
	onCleanup(() => clearInterval(interval));

	createEffect(() => setSeconds(calcSeconds()));

	const [pill, setPill] = createSignal<HTMLDivElement>();
	const [cardVisible, setCardVisible] = createSignal(false);

	return (
		<div class="relative">
			<Pill progress={progress()} ref={setPill}>
				<span class="text-2xl i-fa-brands-spotify text-[#1DB954]" />
				<span class="w-full truncate">
					<span>{props.info.song}</span>
					<span class="font-light text-sm"> &mdash; {props.info.artist}</span>
				</span>
			</Pill>
			<Dismiss menuButton={pill} open={cardVisible} setOpen={setCardVisible}>
				<FloatingCard ref={pill}>
					<Suspense>
						<SpotifyEmbed trackId={props.info.track_id} />
					</Suspense>
				</FloatingCard>
			</Dismiss>
		</div>
	);
}
