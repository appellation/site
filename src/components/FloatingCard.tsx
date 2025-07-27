import { type PropsWithChildren } from "react";
import { Dialog, Popover } from "react-aria-components";

export default function FloatingCard({ children }: PropsWithChildren) {
	return (
		<Popover placement="bottom" offset={10}>
			<Dialog className="bg-white dark:bg-black p-3 rounded shadow flex min-w-0 w-max max-w-96 gap-3">
				{children}
			</Dialog>
		</Popover>
	);
}
