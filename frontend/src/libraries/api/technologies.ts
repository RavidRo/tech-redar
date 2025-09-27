import z from 'zod';
import { CATEGORIES, STAGES } from '../../hooks/useTechnologies';
import { HOST, isoDateFormat, handleResponse as validateResponse } from './api';

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

export async function getTechnologies(): Promise<z.infer<typeof GetTechnologiesResponse>> {
	const response = await fetch(`${HOST}/technologies`);
	await validateResponse(response);
	return GetTechnologiesResponse.parse(await response.json());
}

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
		headers: { 'Content-Type': 'application/json' },
	});
	await validateResponse(response);
}

export async function deleteTechnology(name: string): Promise<void> {
	const response = await fetch(`${HOST}/technologies/${name}`, { method: 'DELETE' });
	await validateResponse(response);
}
