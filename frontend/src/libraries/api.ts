import { z } from 'zod';

const HOST = 'http://localhost:8000';

const GetAppNameResponse = z.object({ name: z.string() });

export async function getAppName(): Promise<z.infer<typeof GetAppNameResponse>> {
	const res = await fetch(`${HOST}/app-name`);
	return GetAppNameResponse.parse(await res.json());
}
