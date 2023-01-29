import classnames from 'classnames';
import type { ParentProps } from 'solid-js';
import { Dynamic, Show } from 'solid-js/web';

export interface StatusPillProps {
	text: string;
	link?: string;
	progress?: number;
}

export default function Pill(props: ParentProps<StatusPillProps>) {
	const containerProps = {
		class: classnames(
			'flex',
			'gap-2',
			'py-2',
			'px-3',
			'rounded-full',
			'items-center',
			'text-stone-600',
			'dark:text-stone-400',
			'bg-stone-300/50',
			'hover:bg-stone-300',
			'dark:hover:bg-stone-700',
			'dark:bg-stone-700/50',
			'max-w-xs',
			'relative',
			'transition-all',
			{ 'cursor-default': !props.link },
		),
		href: props.link,
		target: props.link && '_blank',
	};

	let container: HTMLDivElement | undefined;

	return <Dynamic component={props.link ? 'a' : 'div'} {...containerProps} ref={container}>
		{props.children}
		<div class='w-full truncate'>{props.text}</div>
		<Show when={props.progress}>
			<div class='absolute inset-0 rounded-full overflow-hidden'>
				<div class='absolute top-0 bottom-0 left-0 bg-stone-500/25 transition-transform' style={{ width: `${props.progress! * 100}%` }} />
			</div>
		</Show>
	</Dynamic>;
}
