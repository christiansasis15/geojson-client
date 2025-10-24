export function formatDate(fieldDate: Date) {
	const date = new Date(fieldDate);

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	const isoLocal = `${year}-${month}-${day}T00:00:00Z`;

	return isoLocal;
}
