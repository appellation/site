import { autoUpdate, offset, ReferenceElement, shift } from '@floating-ui/dom';
import { useFloating } from 'solid-floating-ui';
import { createEffect, createSignal, JSX } from 'solid-js';
import useLanyard from './lanyard/useLanyard';
import StatusText from './StatusText';
import SmallProfile from './SmallProfile';

const USER_ID = '618570414855028767';

export default function Profile(): JSX.Element {
	const [ref, setRef] = createSignal<ReferenceElement>();
	const [floating, setFloating] = createSignal<HTMLElement>();

	const position = useFloating(ref, floating, {
		whileElementsMounted: autoUpdate,
		middleware: [shift({ crossAxis: true }), offset(10)],
		placement: 'right',
	});

	const presence = useLanyard(USER_ID);

	createEffect(() => {
		if (presence()) position.update();
	});

	return (
		<div class='relative'>
			<span class='text-lg' ref={setRef}><StatusText presence={presence()} /></span>
			<div
				ref={setFloating}
				class='z-10'
				style={{
					position: position.strategy,
					left: `${position.x ?? 0}px`,
					top: `${position.y ?? 0}px`,
				}}
			>
				<SmallProfile presence={presence()} />
			</div>
		</div>
	)
}
