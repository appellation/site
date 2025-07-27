import { lazy, Suspense, type PropsWithChildren, type RefObject } from "react";

const FloatingCard = lazy(async () => import("./FloatingCard"));

export default function DismissibleCard({
	ref,
	children,
}: PropsWithChildren<{
	readonly ref: RefObject<HTMLButtonElement | null>;
}>) {
	return (
		<Suspense>
			<FloatingCard ref={ref}>{children}</FloatingCard>
		</Suspense>
	);
}
