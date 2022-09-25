import { mapValues } from 'lodash-es';
import { fetchPhotos } from './photos';

export type Pages<T> = Record<string, Contents<T>>;

export interface Contents<T> {
	files: Record<string, T>;
	dirs: Record<string, T>;
}

export async function getAllPages(): Promise<Pages<string>> {
	const photos = await fetchPhotos('/wnelson-photos', '/photos/');
	// console.log(photos);
	return mapValues(photos, (v) => ({
		files: mapValues(v.files, f => decodeURIComponent(f.ObjectName)),
		dirs: mapValues(v.dirs, f => decodeURIComponent(f.ObjectName)),
	}));
}
