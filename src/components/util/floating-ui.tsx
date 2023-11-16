/* eslint @typescript-eslint/no-invalid-void-type: "warn", promise/prefer-await-to-then: "warn" */
/*
MIT License

Copyright (c) 2021 Alexis Munsayac

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import {
	computePosition,
	type ComputePositionConfig,
	type ComputePositionReturn,
	type ReferenceElement,
} from "@floating-ui/dom";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";

function ignore<T>(_value: T): void {
	// no-op
}

export type UseFloatingOptions<
	R extends ReferenceElement,
	F extends HTMLElement
> = Partial<ComputePositionConfig> & {
	whileElementsMounted?(
		reference: R,
		floating: F,
		update: () => void
	): (() => void) | void;
};

type UseFloatingState = Omit<ComputePositionReturn, "x" | "y"> & {
	x?: number | null;
	y?: number | null;
};

export type UseFloatingResult = UseFloatingState & {
	update(): void;
};

export function useFloating<R extends ReferenceElement, F extends HTMLElement>(
	reference: () => R | null | undefined,
	floating: () => F | null | undefined,
	options?: UseFloatingOptions<R, F>
): UseFloatingResult {
	const placement = () => options?.placement ?? "bottom";
	const strategy = () => options?.strategy ?? "absolute";

	const [data, setData] = createSignal<UseFloatingState>({
		x: null,
		y: null,
		placement: placement(),
		strategy: strategy(),
		middlewareData: {},
	});

	const [error, setError] = createSignal<{ value: any } | undefined>();

	createEffect(() => {
		const currentError = error();
		if (currentError) {
			throw currentError.value;
		}
	});

	const version = createMemo(() => {
		reference();
		floating();
		return {};
	});

	function update() {
		const currentReference = reference();
		const currentFloating = floating();

		if (currentReference && currentFloating) {
			const capturedVersion = version();
			computePosition(currentReference, currentFloating, {
				middleware: options?.middleware,
				placement: placement(),
				strategy: strategy(),
			}).then(
				(currentData) => {
					// Check if it's still valid
					if (capturedVersion === version()) {
						setData(currentData);
					}
				},
				(error_) => {
					setError(error_);
				}
			);
		}
	}

	createEffect(() => {
		const currentReference = reference();
		const currentFloating = floating();

		// Subscribe to other reactive properties
		ignore(options?.middleware);
		placement();
		strategy();

		if (currentReference && currentFloating) {
			if (options?.whileElementsMounted) {
				const cleanup = options.whileElementsMounted(
					currentReference,
					currentFloating,
					update
				);

				if (cleanup) {
					onCleanup(cleanup);
				}
			} else {
				update();
			}
		}
	});

	return {
		get x() {
			return data().x;
		},
		get y() {
			return data().y;
		},
		get placement() {
			return data().placement;
		},
		get strategy() {
			return data().strategy;
		},
		get middlewareData() {
			return data().middlewareData;
		},
		update,
	};
}
