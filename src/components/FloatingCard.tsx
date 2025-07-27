import { type PropsWithChildren, type RefObject } from "react";
import { Dialog, Popover } from "react-aria-components";

export type FloatingCardProps = {
	readonly ref: RefObject<HTMLButtonElement | null>;
};

export default function FloatingCard({
	children,
	ref,
}: PropsWithChildren<FloatingCardProps>) {
	return (
		<Popover placement="bottom" offset={10}>
			<Dialog className="bg-white dark:bg-black p-3 rounded shadow flex flex-co min-w-0 w-max max-w-96 gap-3">
				{children}
			</Dialog>
		</Popover>
	);

	// const [floating, setFloating] = createSignal<HTMLDivElement>();
	// const position = useFloating(inner.menuButton, floating, {
	// 	whileElementsMounted: autoUpdate,
	// 	middleware: [flip(), shift(), offset(10)],
	// 	placement: "bottom",
	// });

	// return (
	// 	<div
	// 		{...container}
	// 		ref={setFloating}
	// 		class={clsx("z-20", container.class)}
	// 		style={{
	// 			position: position.strategy,
	// 			left: `${position.x ?? 0}px`,
	// 			top: `${position.y ?? 0}px`,
	// 		}}
	// 	>
	// 		<div class="bg-white dark:bg-black p-3 rounded shadow flex flex-co min-w-0 w-max max-w-96 gap-3">
	// 			{inner.children}
	// 		</div>
	// 	</div>
	// );
}
