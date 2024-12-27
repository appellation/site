export function isPublished({
	data: { draft },
}: {
	data: { draft?: boolean };
}) {
	return draft !== true || import.meta.env.DEV;
}
