import {
	autoUpdate,
	flip,
	offset,
	type ReferenceElement,
	shift,
} from "@floating-ui/dom";
import classNames from "classnames";
import { createSignal, type JSX, type ParentProps, splitProps } from "solid-js";
import { useFloating } from "./util/floating-ui";

export type Props<R extends ReferenceElement> =
	JSX.HTMLAttributes<HTMLDivElement> & {
		ref(): R | null | undefined;
	};

export default function FloatingCard<R extends ReferenceElement>(
	props: ParentProps<Props<R>>,
) {
	const [content, container] = splitProps(props, ["children"]);

	const [floating, setFloating] = createSignal<HTMLElement>();
	// eslint-disable-next-line solid/reactivity
	const position = useFloating(props.ref, floating, {
		whileElementsMounted: autoUpdate,
		middleware: [flip(), shift(), offset(10)],
		placement: "bottom",
	});

	return (
		<div
			{...container}
			ref={setFloating}
			class={classNames("z-20", container.class)}
			style={{
				position: position.strategy,
				left: `${position.x ?? 0}px`,
				top: `${position.y ?? 0}px`,
			}}
		>
			<div class="bg-white dark:bg-black p-3 rounded shadow flex flex-co min-w-0 w-max max-w-96 gap-3">
				{content.children}
			</div>
		</div>
	);
}
