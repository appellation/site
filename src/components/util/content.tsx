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
	subtitle?: string;
	title: string;
}) {
	return title + (subtitle ? ` - ${subtitle}` : "");
}
