import { autoUpdate, offset, ReferenceElement, shift } from '@floating-ui/dom';
import { createMemo, createSignal, ParentProps, Show } from 'solid-js';
import { useFloating } from './util/floating-ui';

export interface Props {
	links: Record<string, string>;
	self: string;
}

export default function Dropdown(props: ParentProps<Props>) {
	const [isOpen, setOpen] = createSignal(false);
	const [ref, setRef] = createSignal<ReferenceElement>();
	const [floating, setFloating] = createSignal<HTMLElement>();
	const hasLinks = createMemo(() => Boolean(Object.keys(props.links).length));

	const position = useFloating(ref, floating, {
		whileElementsMounted: autoUpdate,
		middleware: [offset(5), shift()],
		placement: 'bottom-start',
	});

	return (
		<div onClick={() => setOpen(isOpen => hasLinks() && !isOpen)}>
			<div ref={setRef} class='relative transition-colors hover:bg-stone-300 rounded px-1 cursor-pointer'>
				<Show when={hasLinks()} fallback={<a href={props.self}>{props.children}</a>}>
					<div>
						{props.children}
						<span
							class='inline-block ml-2 align-middle'
							classList={{
								'i-bi-chevron-up': isOpen(),
								'i-bi-chevron-down': !isOpen(),
							}}
						/>
					</div>
				</Show>
			</div>
			<div
				ref={setFloating}
				class='bg-stone-100 p-3 rounded shadow flex-col'
				classList={{ hidden: !isOpen(), flex: isOpen() }}
				style={{
					position: position.strategy,
					left: `${position.x ?? 0}px`,
					top: `${position.y ?? 0}px`,
				}}
			>
				<ul>
					{Object.entries(props.links).map(([url, name]) => (
						<a class='block transition-colors hover:bg-stone-200 rounded px-1' href={url}>{name}</a>
					))}
				</ul>
			</div>
		</div>
	);
}
