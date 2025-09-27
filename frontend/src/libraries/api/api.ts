import { z } from 'zod';

export const HOST = 'http://localhost:8000';

export const ClientErrorResponse = z.object({ detail: z.string() });

export const isoDateFormat = z
	.string()
	.refine((v) => !isNaN(Date.parse(v)), 'Invalid date')
	.transform((v) => new Date(v));

export const handleResponse = async (response: Response) => {
	if (!response.ok) {
		const result = ClientErrorResponse.safeParse(await response.json());
		const text = result.success ? result.data.detail : await response.text();
		throw Error(`${response.statusText}(${String(response.status)}): ${text}`);
	}
};
