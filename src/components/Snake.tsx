import init, { main } from 'snake';
import { createEffect } from 'solid-js';

export default function Snake() {
	createEffect(async () => {
		await init();
		main("#snake");
	});

	return (
		<div class="max-w-xl max-h-xl h-full w-full aspect-square">
			<canvas id="snake" class='outline-none' />
		</div>
	);
}
