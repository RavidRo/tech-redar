import { z } from 'zod';
import { CATEGORIES, STAGES } from '../hooks/useTechnologies';

const HOST = 'http://localhost:8000';

const GetAppNameResponse = z.object({ name: z.string() });

const isoDateFormat = z
	.string()
	.refine((v) => !isNaN(Date.parse(v)), 'Invalid date')
	.transform((v) => new Date(v));

export async function getAppName(): Promise<z.infer<typeof GetAppNameResponse>> {
	const res = await fetch(`${HOST}/app-name`);
	return GetAppNameResponse.parse(await res.json());
}
const GetTechnologiesResponse = z.array(
	z.object({
		name: z.string(),
		category: z.enum(CATEGORIES),
		stage: z.enum(STAGES),
		tags: z.array(z.string()),
		history: z.object({
			stageTransitions: z.array(
				z.object({
					originalStage: z.enum(STAGES),
					transitionDate: isoDateFormat,
					adrLink: z.string(),
				}),
			),
			discovery: z.object({
				discoveryDate: isoDateFormat,
				adrLink: z.string().nullable(),
			}),
		}),
	}),
);

const ClientErrorResponse = z.object({ detail: z.string() });

interface AddTechnologyRequest {
	name: string;
	category: string;
	stage: string;
	tags: string[];
	adrLink: string | null;
}

export async function addTechnology(addTechnologyRequest: AddTechnologyRequest): Promise<void> {
	const response = await fetch(`${HOST}/technologies`, {
		method: 'PUT',
		body: JSON.stringify(addTechnologyRequest),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	if (!response.ok) {
		if (response.status >= 400 && response.status < 500) {
			const result = ClientErrorResponse.safeParse(await response.json());
			if (result.success) {
				throw Error(result.data.detail);
			}
		}
		throw Error(await response.text());
	}
}

export async function getTechnologies(): Promise<z.infer<typeof GetTechnologiesResponse>> {
	const res = await fetch(`${HOST}/technologies`);
	return GetTechnologiesResponse.parse(await res.json());
}
