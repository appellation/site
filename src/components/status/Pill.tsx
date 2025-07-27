import clsx from "clsx";
import type { PropsWithChildren, RefObject } from "react";
import { Button, type ButtonProps } from "react-aria-components";

export type StatusPillProps = PropsWithChildren<{
	readonly container?: Omit<ButtonProps, "ref">;
	readonly progress?: number;
	readonly ref?: RefObject<HTMLButtonElement | null>;
}>;

export default function Pill({
	ref,
	container,
	progress,
	children,
}: StatusPillProps) {
	const clazz = clsx(
		container?.className,
		"py-2",
		"px-4",
		"rounded-full",
		"text-stone-600",
		"dark:text-stone-400",
		"bg-stone-300/50",
		"hover:bg-stone-300",
		"dark:hover:bg-stone-700",
		"dark:bg-stone-700/50",
		"max-w-xs",
		"relative",
		"transition-all",
		"cursor-pointer",
	);

	return (
		<Button {...container} ref={ref} className={clazz}>
			<span className="flex gap-2 items-center z-10 relative font-medium">
				{children}
			</span>
			{progress != null ? <Progress progress={progress} /> : null}
		</Button>
	);
}

function Progress({ progress }: { readonly progress: number }) {
	return (
		<span className="absolute inset-0 rounded-full overflow-hidden">
			<span
				className="absolute top-0 bottom-0 left-0 bg-stone-400/25"
				style={{ width: `${progress * 100}%` }}
				suppressHydrationWarning // progress is inevitably different on the client
			/>
		</span>
	);
}
