import { autoUpdate, flip, offset, ReferenceElement } from '@floating-ui/dom';
import { createSignal, ParentProps } from 'solid-js';
import { useFloating, UseFloatingOptions } from './util/floating-ui';

export interface Props<R extends ReferenceElement> {
	ref(): R | null | undefined;
	options?: UseFloatingOptions<R, HTMLElement>;
}

export default function FloatingCard<R extends ReferenceElement>(props: ParentProps<Props<R>>) {
	const [floating, setFloating] = createSignal<HTMLElement>();
	const position = useFloating(props.ref, floating, {
		whileElementsMounted: autoUpdate,
		middleware: [flip({ fallbackPlacements: ['bottom', 'top'] }), offset(10)],
		placement: 'right',
	});

	return (
		<div
			ref={setFloating}
			class='z-10'
			style={{
				position: position.strategy,
				left: `${position.x ?? 0}px`,
				top: `${position.y ?? 0}px`,
			}}
		>
			<div class='bg-white dark:bg-black p-3 rounded shadow flex flex-col w-96 gap-3'>
				{props.children}
			</div>
		</div>
	)
}
