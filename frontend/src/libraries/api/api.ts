import { z } from 'zod';

export const HOST = 'http://localhost:8000';

export const ClientErrorResponse = z.object({ detail: z.string() });

export const isoDateFormat = z
	.string()
	.refine((v) => !isNaN(Date.parse(v)), 'Invalid date')
	.transform((v) => new Date(v));

export const handleResponse = async (response: Response) => {
	if (!response.ok) {
		if (response.status >= 400 && response.status < 500) {
			const result = ClientErrorResponse.safeParse(await response.json());
			if (result.success) {
				throw Error(result.data.detail);
			}
		}
		throw Error(await response.text());
	}
};
