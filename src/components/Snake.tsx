import init, { main, set_is_dark_mode } from '@appellation/snake';
import { onCleanup, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';

export default function Snake() {
	if (!isServer) {
		const query = window.matchMedia('(prefers-color-scheme: dark)');
		const listener = (ev: MediaQueryListEvent) => set_is_dark_mode(ev.matches);

		onMount(async () => {
			await init();
			set_is_dark_mode(query.matches);

			main("#snake");
		});

		onMount(() => {
			query.addEventListener('change', listener);
		});

		onCleanup(() => {
			query.removeEventListener('change', listener);
		});
	}

	return (
		<div class="aspect-square min-w-0 min-h-0 max-w-full max-h-full">
			<canvas id="snake" class="outline-none" />
		</div>
	);
}
