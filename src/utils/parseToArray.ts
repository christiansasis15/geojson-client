export default function parseToArray(data: unknown): number[] {
	if (!data && data !== 0) return [];

	if (Array.isArray(data)) {
		return data.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
	}

	if (typeof data === "string") {
		return (
			data
				.match(/\d+\.\d+/g)
				?.map(Number)
				.filter((n) => !Number.isNaN(n)) ?? []
		);
	}

	if (typeof data === "number") return [data];

	return [];
}
