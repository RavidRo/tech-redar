type ReplaceDates<T> = T extends Date
	? string
	: T extends (infer U)[]
		? ReplaceDates<U>[]
		: T extends object
			? { [K in keyof T]: ReplaceDates<T[K]> }
			: T;

export function serializeDates<T>(input: T): ReplaceDates<T> {
	if (input instanceof Date) {
		return input.toISOString() as ReplaceDates<T>;
	}

	if (Array.isArray(input)) {
		return input.map((item) => serializeDates<unknown>(item)) as ReplaceDates<T>;
	}

	if (input !== null && typeof input === 'object') {
		const entries: [unknown, ReplaceDates<unknown>][] = Object.entries(input).map(
			([key, value]) => [key, serializeDates<unknown>(value)],
		);
		return Object.fromEntries(entries) as ReplaceDates<T>;
	}

	return input as ReplaceDates<T>;
}
