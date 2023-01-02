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
		<div class="max-w-xl max-h-xl h-full w-full aspect-square">
			<canvas id="snake" class='outline-none' />
		</div>
	);
}
