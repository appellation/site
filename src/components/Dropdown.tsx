import Dismiss from 'solid-dismiss';
import { createMemo, createSignal, mergeProps, ParentProps, Show } from 'solid-js';
import FloatingCard from './FloatingCard';

export interface Props {
	links: Record<string, string>;
	collapseSingle?: boolean;
}

export default function Dropdown(props: ParentProps<Props>) {
	props = mergeProps({ collapseSingle: true }, props);

	const [isOpen, setOpen] = createSignal(false);
	const [ref, setRef] = createSignal<HTMLElement>();
	const firstLink = createMemo(() => Object.keys(props.links)[0]);
	const hasManyLinks = createMemo(() => !Boolean(props.collapseSingle) || Object.keys(props.links).length > 1);

	return (
		<div class='inline-block relative'>
			<div class='transition-colors hover:bg-stone-300 rounded px-1 cursor-pointer'>
				<Show when={hasManyLinks()} fallback={<a href={firstLink()} rel="prefetch">{props.children}</a>}>
					<button ref={setRef} class='flex gap-2 items-center'>
						<Show when={props.children}>
							<div>{props.children}</div>
						</Show>
						<div
							classList={{
								'i-bi-chevron-up': isOpen(),
								'i-bi-chevron-down': !isOpen(),
							}}
						/>
					</button>
				</Show>
			</div>
			<Dismiss
				menuButton={ref}
				open={isOpen}
				setOpen={setOpen}
			>
				<FloatingCard ref={ref}>
					<ul class='min-w-24'>
						{Object.entries(props.links).map(([url, name]) => (
							<a class='block transition-colors hover:bg-stone-200 rounded px-1' href={url} rel='prefetch'>{name}</a>
						))}
					</ul>
				</FloatingCard>
			</Dismiss>
		</div>
	);
}
