import { chain } from 'lodash-es';

export function intersperse<T>(array: T[], sep: T): T[] {
	return chain(array)
		.flatMap(x => [x, sep])
		.slice(0, -1)
		.value();
}
