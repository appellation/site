import { partition, memoize, keyBy, escapeRegExp, merge } from "lodash-es";
import type { Pages } from './path';

export interface Photo {
	Guid: string;
	StorageZoneName: string;
	Path: string;
	ObjectName: string;
	Length: number;
	LastChanged: string;
	ServerId: number;
	ArrayNumber: number;
	IsDirectory: boolean;
	UserId: string;
	ContentType: string;
	DateCreated: string;
	StorageZoneId: number;
	Checksum: null;
	ReplicatedZones: null;
}

async function loadPhotos(path: string): Promise<Photo[]> {
	const res = await fetch(
		`https://la.storage.bunnycdn.com${path}/`,
		{
			headers: {
				accept: "application/json",
				accesskey: import.meta.env.BUNNY_STORAGE_PASSWORD,
			},
		}
	);

	if (!res.ok) {
		console.warn(path, await res.text());
		return [];
	}

	return res.json();
}

const memoLoadPhotos = memoize(loadPhotos);

export async function fetchPhotos(base: string, replace: string = '/', path: string = base): Promise<Pages<Photo>> {
	const body: Photo[] = await memoLoadPhotos(path);

	const [dirs, files] = partition(body, (f) => f.IsDirectory);

	const baseRegex = new RegExp('^' + escapeRegExp(base) + '/?');
	const actualPath = path.replace(baseRegex, replace);
	return merge(
		{
			[actualPath]: {
				files: keyBy(files, f => (f.Path + f.ObjectName).replace(baseRegex, replace)),
				dirs: keyBy(dirs, f => (f.Path + f.ObjectName + '/').replace(baseRegex, replace)),
			},
		},
		...await Promise.all(dirs.map((f) => fetchPhotos(base, replace, f.Path + f.ObjectName)))
	);
}
