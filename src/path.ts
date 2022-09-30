import { mapValues } from 'lodash-es';

/**
 * Map of path to contents.
 */
export type Pages<T> = Map<string, Pages<T> | null>;


function makePaths(files: string[]): Pages<string> {
	const contents: Pages<string> = new Map();
	for (const file of files) {
		const segments = file.split('/');
		const filename = segments.pop();
		let lastPage = contents;

		for (const segment of segments) {
			if (!lastPage.get(segment)) {
				lastPage.set(segment, new Map());
			}

			lastPage = lastPage.get(segment)!;
		}

		// if (filename) lastPage.set(filename, null);
	}

	return contents;
}

export function getAllPages(): Pages<string> {
	const staticPages = import.meta.glob('./pages/**/*.astro');
	return makePaths(Object.keys(staticPages));
}
