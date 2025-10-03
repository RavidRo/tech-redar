import { handleResponse, handleVoidResponse } from '../errors';
import {
	AddTechnologyRequestSchema,
	GetTechnologiesResponseSchema,
	UpdateTechnologyRequestSchema,
	type AddTechnologyRequest,
	type GetTechnologiesResponse,
	type UpdateTechnologyRequest,
} from './schemas';

const HOST = 'http://localhost:8000';

// API client functions
export async function getTechnologies(params?: {
	search?: string;
	categories?: string[];
	stages?: string[];
	tags?: string[];
}): Promise<GetTechnologiesResponse> {
	const url = new URL(`${HOST}/technologies`);

	if (params) {
		if (params.search) {
			url.searchParams.set('search', params.search);
		}
		if (params.categories?.length) {
			params.categories.forEach((category) => {
				url.searchParams.append('categories', category);
			});
		}
		if (params.stages?.length) {
			params.stages.forEach((stage) => {
				url.searchParams.append('stages', stage);
			});
		}
		if (params.tags?.length) {
			params.tags.forEach((tag) => {
				url.searchParams.append('tags', tag);
			});
		}
	}

	const response = await fetch(url.toString());
	return handleResponse(response, GetTechnologiesResponseSchema);
}

export async function addTechnology(request: AddTechnologyRequest): Promise<void> {
	const validatedRequest = AddTechnologyRequestSchema.parse(request);

	const response = await fetch(`${HOST}/technologies`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(validatedRequest),
	});

	await handleVoidResponse(response);
}

export async function deleteTechnology(name: string): Promise<void> {
	if (!name || name.trim().length === 0) {
		throw new Error('Technology name is required for deletion');
	}

	const response = await fetch(`${HOST}/technologies/${encodeURIComponent(name)}`, {
		method: 'DELETE',
	});

	await handleVoidResponse(response);
}

export async function updateTechnology(
	name: string,
	request: UpdateTechnologyRequest,
): Promise<void> {
	if (!name || name.trim().length === 0) {
		throw new Error('Technology name is required for update');
	}
	const validatedRequest = UpdateTechnologyRequestSchema.parse(request);

	const response = await fetch(`${HOST}/technologies/${encodeURIComponent(name)}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(validatedRequest),
	});

	await handleVoidResponse(response);
}
