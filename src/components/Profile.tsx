import { autoUpdate, flip, inline, offset, ReferenceElement } from '@floating-ui/dom';
import { useFloating } from './util/floating-ui';
import { createSignal, JSX, lazy, Show, Suspense } from 'solid-js';
import { Portal } from 'solid-js/web';

import useLanyard from './lanyard/useLanyard';
import StatusText from './StatusText';

const SmallProfile = lazy(() => import('./SmallProfile'));

const USER_ID = '618570414855028767';

function LazyProfile() {
	return (
		<Suspense>
			<Profile />
		</Suspense>
	);
}

export default function Profile(): JSX.Element {
	const [ref, setRef] = createSignal<ReferenceElement>();
	const [floating, setFloating] = createSignal<HTMLElement>();
	const [cardVisible, setCardVisible] = createSignal<boolean>(false);

	const position = useFloating(ref, floating, {
		whileElementsMounted: autoUpdate,
		middleware: [flip({ fallbackPlacements: ['bottom', 'top'] }), offset(10)],
		placement: 'right',
	});

	const presence = useLanyard(USER_ID);

	return (
		<div class='relative'>
			<span class='text-lg' ref={setRef}>
				<Show when={presence()} fallback={<span>👀</span>}>
					<span class='cursor-pointer' onClick={() => setCardVisible(v => !v)}>
						<StatusText presence={presence()!} />
					</span>
				</Show>
			</span>
			<Show when={cardVisible() && presence()}>
				<div
					ref={setFloating}
					class='z-10'
					style={{
						position: position.strategy,
						left: `${position.x ?? 0}px`,
						top: `${position.y ?? 0}px`,
					}}
				>
					<div class='bg-white p-3 rounded shadow flex flex-col w-96 gap-3'>
						<Suspense>
							<SmallProfile presence={presence()!} />
						</Suspense>
					</div>
				</div>
			</Show>
			<Portal>
				<div class='fixed inset-0' style={{ display: cardVisible() ? 'block' : 'none' }} onClick={() => setCardVisible(v => !v)} />
			</Portal>
		</div>
	)
}
