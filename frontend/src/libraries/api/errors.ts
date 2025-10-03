import { z } from 'zod';

// Error response schema
export const ClientErrorResponseSchema = z.object({
	detail: z.union([z.string(), z.object({}), z.array(z.unknown())]),
});

export type ClientErrorResponse = z.infer<typeof ClientErrorResponseSchema>;

export async function handleResponse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
	if (!response.ok) {
		const responseBackup = response.clone();
		try {
			const errorData: unknown = await response.json();
			const parsedError = ClientErrorResponseSchema.safeParse(errorData);
			const details: unknown = parsedError.success ? parsedError.data.detail : errorData;

			throw new Error(
				`API request failed: ${response.statusText} (${String(response.status)}): ${JSON.stringify(details)}`,
			);
		} catch {
			// If JSON parsing fails, use text response
			const text = await responseBackup.text();
			throw new Error(
				`API request failed: ${response.statusText} (${String(response.status)}): ${text}`,
			);
		}
	}

	try {
		const data: unknown = await response.json();
		const validationResult = schema.safeParse(data);

		if (!validationResult.success) {
			const issues = validationResult.error.issues;
			const firstError = issues.length > 0 ? issues[0] : null;
			const errorMessage = firstError ? firstError.message : 'Invalid data format';
			throw new Error(`API response validation failed: ${errorMessage}`);
		}

		return validationResult.data;
	} catch (error) {
		if (error instanceof Error && error.message.includes('validation failed')) {
			throw error;
		}
		throw new Error(
			`Failed to parse API response: ${response.statusText} (${String(response.status)})`,
		);
	}
}

export async function handleVoidResponse(response: Response): Promise<void> {
	await handleResponse(response, z.void().nullable());
}
