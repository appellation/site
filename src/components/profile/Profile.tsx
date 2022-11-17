import type { ReferenceElement } from '@floating-ui/dom';
import { createSignal, JSX, lazy, Show, Suspense } from 'solid-js';
import { Portal } from 'solid-js/web';

import useLanyard from '../lanyard/useLanyard';
import SmallProfile from './SmallProfile';
import StatusText from '../StatusText';

const FloatingCard = lazy(() => import('../FloatingCard'));

const USER_ID = '618570414855028767';

export default function Profile(): JSX.Element {
	const [ref, setRef] = createSignal<ReferenceElement>();
	const [cardVisible, setCardVisible] = createSignal<boolean>(false);

	const presence = useLanyard(USER_ID);

	return (
		<div class='relative'>
			<Show when={presence()} fallback={<span class='text-lg'>👀</span>}>
				<span class='text-lg cursor-pointer' ref={setRef} onClick={() => setCardVisible(v => !v)}>
					<StatusText presence={presence()!} />
				</span>
			</Show>
			<Show when={cardVisible() && presence()}>
				<Suspense>
					<FloatingCard ref={ref}>
						<SmallProfile presence={presence()!} />
					</FloatingCard>
				</Suspense>
			</Show>
			<Show when={cardVisible()}>
				<Portal>
					<div class='fixed inset-0' onClick={() => setCardVisible(v => !v)} />
				</Portal>
			</Show>
		</div>
	)
}
