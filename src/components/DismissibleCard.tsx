import { lazy, Suspense, type PropsWithChildren } from "react";

const FloatingCard = lazy(async () => import("./FloatingCard"));

export default function DismissibleCard({ children }: PropsWithChildren) {
	return (
		<Suspense>
			<FloatingCard>{children}</FloatingCard>
		</Suspense>
	);
}
