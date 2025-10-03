import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addTechnology, deleteTechnology, getTechnologies, updateTechnology } from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
(globalThis as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;

describe('Technologies API Client', () => {
	beforeEach(() => {
		mockFetch.mockClear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('getTechnologies', () => {
		it('should fetch technologies successfully', async () => {
			const mockResponse = {
				technologies: [
					{
						name: 'React',
						category: 'Frameworks',
						stage: 'Adopt',
						tags: ['frontend'],
						detailsPage: 'https://react.dev',
						history: {
							stageTransitions: [],
							discoveryDate: '2024-01-01T00:00:00Z',
						},
					},
				],
				metadata: {
					total_count: 1,
					categories: ['Frameworks'],
					stages: ['Adopt'],
					available_tags: ['frontend'],
				},
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const result = await getTechnologies();
			expect(result).toEqual({
				...mockResponse,
				technologies: [
					{
						...mockResponse.technologies[0],
						history: {
							...mockResponse.technologies[0].history,
							discoveryDate: new Date('2024-01-01T00:00:00Z'),
						},
					},
				],
			});
			expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/technologies');
		});

		it('should handle query parameters correctly', async () => {
			const mockResponse = {
				technologies: [],
				metadata: {
					total_count: 0,
					categories: [],
					stages: [],
					available_tags: [],
				},
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			await getTechnologies({
				search: 'react',
				categories: ['Frameworks', 'Development Tools'],
				stages: ['Adopt'],
				tags: ['frontend'],
			});

			const expectedUrl = new URL('http://localhost:8000/technologies');
			expectedUrl.searchParams.set('search', 'react');
			expectedUrl.searchParams.append('categories', 'Frameworks');
			expectedUrl.searchParams.append('categories', 'Development Tools');
			expectedUrl.searchParams.append('stages', 'Adopt');
			expectedUrl.searchParams.append('tags', 'frontend');

			expect(mockFetch).toHaveBeenCalledWith(expectedUrl.toString());
		});

		it('should throw error on HTTP error', async () => {
			const mockResponse = {
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
				json: () => Promise.resolve({ detail: 'Server error' }),
				clone: () => ({
					json: () => Promise.resolve({ detail: 'Server error' }),
					text: () => Promise.resolve('Server error'),
				}),
			};
			mockFetch.mockResolvedValueOnce(mockResponse);

			await expect(getTechnologies()).rejects.toThrow('API request failed');
		});

		it('should throw error on invalid response data', async () => {
			const invalidResponse = {
				technologies: [
					{
						name: 'React',
						category: 'InvalidCategory', // Invalid category
						stage: 'Adopt',
						tags: ['frontend'],
						detailsPage: 'https://react.dev',
						history: {
							stageTransitions: [],
							discoveryDate: '2024-01-01T00:00:00Z',
						},
					},
				],
				metadata: {
					total_count: 1,
					categories: ['Frameworks'],
					stages: ['Adopt'],
					available_tags: ['frontend'],
				},
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(invalidResponse),
			});

			await expect(getTechnologies()).rejects.toThrow('validation failed');
		});
	});

	describe('addTechnology', () => {
		it('should add technology successfully', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(),
			});

			const request = {
				name: 'Vue.js',
				category: 'Frameworks' as const,
				stage: 'Trial' as const,
				tags: ['frontend'],
				detailsPage: 'https://vuejs.org',
			};

			await expect(addTechnology(request)).resolves.toBeUndefined();
			expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/technologies', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(request),
			});
		});

		it('should validate request data before sending', async () => {
			const invalidRequest = {
				name: '', // Empty name should fail validation
				category: 'Frameworks' as const,
				stage: 'Trial' as const,
				tags: [],
				detailsPage: null,
			};

			await expect(addTechnology(invalidRequest)).rejects.toThrow();
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it('should throw error on HTTP error', async () => {
			const mockResponse = {
				ok: false,
				status: 409,
				statusText: 'Conflict',
				json: () => Promise.resolve({ detail: 'Technology already exists' }),
				clone: () => ({
					json: () => Promise.resolve({ detail: 'Technology already exists' }),
					text: () => Promise.resolve('Technology already exists'),
				}),
			};
			mockFetch.mockResolvedValueOnce(mockResponse);

			const request = {
				name: 'Vue.js',
				category: 'Frameworks' as const,
				stage: 'Trial' as const,
				tags: [],
				detailsPage: null,
			};

			await expect(addTechnology(request)).rejects.toThrow('409');
		});
	});

	describe('deleteTechnology', () => {
		it('should delete technology successfully', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(),
			});

			await expect(deleteTechnology('React')).resolves.toBeUndefined();
			expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/technologies/React', {
				method: 'DELETE',
			});
		});

		it('should encode technology name in URL', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(),
			});

			await deleteTechnology('Technology with spaces');
			expect(mockFetch).toHaveBeenCalledWith(
				'http://localhost:8000/technologies/Technology%20with%20spaces',
				{
					method: 'DELETE',
				},
			);
		});

		it('should throw error for empty name', async () => {
			await expect(deleteTechnology('')).rejects.toThrow(
				'Technology name is required for deletion',
			);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it('should throw error on HTTP error', async () => {
			const mockResponse = {
				ok: false,
				status: 404,
				statusText: 'Not Found',
				json: () => Promise.resolve({ detail: 'Technology not found' }),
				clone: () => ({
					json: () => Promise.resolve({ detail: 'Technology not found' }),
					text: () => Promise.resolve('Technology not found'),
				}),
			};
			mockFetch.mockResolvedValueOnce(mockResponse);

			await expect(deleteTechnology('NonExistent')).rejects.toThrow('404');
		});
	});

	describe('updateTechnology', () => {
		it('should update technology successfully', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(),
			});

			const request = {
				category: 'Frameworks' as const,
				tags: ['frontend', 'javascript'],
				detailsPage: 'https://react.dev',
				stageTransition: {
					newStage: 'Adopt' as const,
					adrLink: 'https://example.com/adr/123',
				},
			};

			await expect(updateTechnology('React', request)).resolves.toBeUndefined();
			expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/technologies/React', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(request),
			});
		});

		it('should encode technology name in URL', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(),
			});

			const request = {
				category: 'Frameworks' as const,
				tags: [],
				detailsPage: null,
				stageTransition: null,
			};

			await updateTechnology('Technology with spaces', request);
			expect(mockFetch).toHaveBeenCalledWith(
				'http://localhost:8000/technologies/Technology%20with%20spaces',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(request),
				},
			);
		});

		it('should throw error for empty name', async () => {
			const request = {
				category: 'Frameworks' as const,
				tags: [],
				detailsPage: null,
				stageTransition: null,
			};

			await expect(updateTechnology('', request)).rejects.toThrow(
				'Technology name is required for update',
			);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it('should validate request data before sending', async () => {
			const invalidRequest = {
				category: 'InvalidCategory' as 'Frameworks', // Invalid category
				tags: [],
				detailsPage: null,
				stageTransition: null,
			};

			await expect(updateTechnology('React', invalidRequest)).rejects.toThrow();
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it('should throw error on HTTP error', async () => {
			const mockResponse = {
				ok: false,
				status: 404,
				statusText: 'Not Found',
				json: () => Promise.resolve({ detail: 'Technology not found' }),
				clone: () => ({
					json: () => Promise.resolve({ detail: 'Technology not found' }),
					text: () => Promise.resolve('Technology not found'),
				}),
			};
			mockFetch.mockResolvedValueOnce(mockResponse);

			const request = {
				category: 'Frameworks' as const,
				tags: [],
				detailsPage: null,
				stageTransition: null,
			};

			await expect(updateTechnology('NonExistent', request)).rejects.toThrow('404');
		});
	});
});
