import { partition, memoize, keyBy, escapeRegExp, merge } from "lodash-es";

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
		throw new Error(await res.text());
	}

	return res.json();
}

const memoLoadPhotos = memoize(loadPhotos);

export interface FetchPhotosOptions {
	replace?: string;
	path?: string;
	recursive?: boolean;
}

export type PhotoPage = Record<string, { files: Photo, dirs: Photo }>;

export async function fetchPhotos(base: string, { replace = '/', path = base, recursive }: FetchPhotosOptions = {}): Promise<PhotoPage> {
	const body: Photo[] = await memoLoadPhotos(path);

	const [dirs, files] = partition(body, (f) => f.IsDirectory);

	const baseRegex = new RegExp('^' + escapeRegExp(base) + '/?');
	const actualPath = path.replace(baseRegex, replace);
	const nested = recursive ? Promise.all(dirs.map((f) => fetchPhotos(base, { replace, path: f.Path + f.ObjectName }))) : Promise.resolve([]);

	return merge(
		{
			[actualPath]: {
				files: keyBy(files, f => (f.Path + f.ObjectName).replace(baseRegex, replace)),
				dirs: keyBy(dirs, f => (f.Path + f.ObjectName + '/').replace(baseRegex, replace)),
			},
		},
		...await nested
	);
}
