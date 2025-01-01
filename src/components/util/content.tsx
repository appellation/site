export function isPublished({
	data: { draft },
}: {
	data: { draft?: boolean };
}) {
	return draft !== true || import.meta.env.DEV;
}

export function postTitle({
	title,
	subtitle,
}: {
	title: string;
	subtitle?: string;
}) {
	return title + (subtitle ? ` - ${subtitle}` : "");
}
