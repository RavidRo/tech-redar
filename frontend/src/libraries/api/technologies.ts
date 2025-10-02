import z from 'zod';
import { CATEGORIES, STAGES } from '../../hooks/useTechnologies';
import { HOST, isoDateFormat, handleResponse as validateResponse } from './api';

const JsonContentTypeHeaders = { 'Content-Type': 'application/json' };

const GetTechnologiesResponse = z.object({
	technologies: z.array(
		z.object({
			name: z.string(),
			category: z.enum(CATEGORIES),
			stage: z.enum(STAGES),
			tags: z.array(z.string()),
			detailsPage: z.string().nullable(),
			history: z.object({
				stageTransitions: z.array(
					z.object({
						originalStage: z.enum(STAGES),
						transitionDate: isoDateFormat,
						adrLink: z.string(),
					}),
				),
				discoveryDate: isoDateFormat,
			}),
		}),
	),
});

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
	detailsPage: string | null;
}

export async function addTechnology(addTechnologyRequest: AddTechnologyRequest): Promise<void> {
	const response = await fetch(`${HOST}/technologies`, {
		method: 'PUT',
		body: JSON.stringify(addTechnologyRequest),
		headers: JsonContentTypeHeaders,
	});
	await validateResponse(response);
}

export async function deleteTechnology(name: string): Promise<void> {
	const response = await fetch(`${HOST}/technologies/${name}`, { method: 'DELETE' });
	await validateResponse(response);
}

interface UpdateTechnologyRequest {
	category: string;
	tags: string[];
	detailsPage: string | null;
	stageTransition: {
		newStage: string;
		adrLink: string;
	} | null;
}

export async function updateTechnology(
	technology: UpdateTechnologyRequest & { name: string },
): Promise<void> {
	const { ['name']: name, ...rest } = technology;
	const response = await fetch(`${HOST}/technologies/${name}`, {
		method: 'POST',
		body: JSON.stringify(rest),
		headers: JsonContentTypeHeaders,
	});
	await validateResponse(response);
}
