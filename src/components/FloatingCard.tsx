import { type PropsWithChildren } from "react";
import { Dialog, Popover } from "react-aria-components";

export default function FloatingCard({ children }: PropsWithChildren) {
	return (
		<Popover
			className="transition data-entering:-translate-y-1 data-entering:opacity-0 data-exiting:-translate-y-1 data-exiting:opacity-0"
			offset={10}
			placement="bottom"
		>
			<Dialog className="bg-white dark:bg-black p-3 rounded shadow flex min-w-0 w-max max-w-96 gap-3">
				{children}
			</Dialog>
		</Popover>
	);
}
