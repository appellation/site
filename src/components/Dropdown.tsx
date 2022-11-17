import { autoUpdate, offset, ReferenceElement, shift } from '@floating-ui/dom';
import { createMemo, createSignal, mergeProps, ParentProps, Show } from 'solid-js';
import { useFloating } from './util/floating-ui';

export interface Props {
	links: Record<string, string>;
	collapseSingle?: boolean;
}

export default function Dropdown(props: ParentProps<Props>) {
	props = mergeProps({ collapseSingle: true }, props);

	const [isOpen, setOpen] = createSignal(false);
	const [ref, setRef] = createSignal<ReferenceElement>();
	const [floating, setFloating] = createSignal<HTMLElement>();
	const firstLink = createMemo(() => Object.keys(props.links)[0]);
	const hasManyLinks = createMemo(() => !Boolean(props.collapseSingle) || Object.keys(props.links).length > 1);

	const position = useFloating(ref, floating, {
		whileElementsMounted: autoUpdate,
		middleware: [offset(5), shift()],
		placement: 'bottom-start',
	});

	return (
		<div onClick={() => setOpen(isOpen => hasManyLinks() && !isOpen)}>
			<div ref={setRef} class='relative transition-colors hover:bg-stone-300 rounded px-1 cursor-pointer'>
				<Show when={hasManyLinks()} fallback={<a href={firstLink()} rel="prefetch">{props.children}</a>}>
					<div class='flex flex-row'>
						<Show when={props.children}>
							<span class='mr-2'>{props.children}</span>
						</Show>
						<span
							class='inline-block self-center'
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
				class='bg-stone-100 p-3 rounded shadow flex-col min-w-32'
				classList={{ hidden: !isOpen(), flex: isOpen() }}
				style={{
					position: position.strategy,
					left: `${position.x ?? 0}px`,
					top: `${position.y ?? 0}px`,
				}}
			>
				<ul>
					{Object.entries(props.links).map(([url, name]) => (
						<a class='block transition-colors hover:bg-stone-200 rounded px-1' href={url} rel='prefetch'>{name}</a>
					))}
				</ul>
			</div>
		</div>
	);
}
