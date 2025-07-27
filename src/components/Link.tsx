import type { PropsWithChildren } from "react";

export type LinkProps = PropsWithChildren<{
	readonly href: string;
}>;

export default function Link({ href, children }: LinkProps) {
	return (
		<a
			href={href}
			rel="prefetch"
			className="transition-colors hover:bg-stone-300 dark:hover:bg-stone-700 rounded px-1 cursor-pointer"
		>
			{children}
		</a>
	);
}
