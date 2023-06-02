import type { ParentProps } from "solid-js";

export interface LinkProps {
	href: string;
}

export default function Link(props: ParentProps<LinkProps>) {
	return (
		<a
			href={props.href}
			rel="prefetch"
			class="transition-colors hover:bg-stone-300 dark:hover:bg-stone-700 rounded px-1 cursor-pointer"
		>
			{props.children}
		</a>
	);
}
