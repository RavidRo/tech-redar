import { describe, expect, it } from 'vitest';
import {
	AddTechnologyRequestSchema,
	CATEGORIES,
	GetTechnologiesResponseSchema,
	NewStageTransitionSchema,
	STAGES,
	StageTransitionSchema,
	TechnologyHistorySchema,
	TechnologyMetadataSchema,
	TechnologySchema,
	UpdateTechnologyRequestSchema,
} from '../schemas';

describe('Technologies Schemas', () => {
	describe('StageTransitionSchema', () => {
		it('should validate a valid stage transition', () => {
			const validTransition = {
				originalStage: 'Hold',
				transitionDate: '2024-01-15T10:30:00Z',
				adrLink: 'https://example.com/adr/123',
			};

			const result = StageTransitionSchema.safeParse(validTransition);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.originalStage).toBe('Hold');
				expect(result.data.transitionDate).toBeInstanceOf(Date);
				expect(result.data.adrLink).toBe('https://example.com/adr/123');
			}
		});

		it('should reject invalid stage', () => {
			const invalidTransition = {
				originalStage: 'InvalidStage',
				transitionDate: '2024-01-15T10:30:00Z',
				adrLink: 'https://example.com/adr/123',
			};

			const result = StageTransitionSchema.safeParse(invalidTransition);
			expect(result.success).toBe(false);
		});

		it('should reject invalid date format', () => {
			const invalidTransition = {
				originalStage: 'Hold',
				transitionDate: 'invalid-date',
				adrLink: 'https://example.com/adr/123',
			};

			const result = StageTransitionSchema.safeParse(invalidTransition);
			expect(result.success).toBe(false);
		});

		it('should reject invalid URL', () => {
			const invalidTransition = {
				originalStage: 'Hold',
				transitionDate: '2024-01-15T10:30:00Z',
				adrLink: 'not-a-url',
			};

			const result = StageTransitionSchema.safeParse(invalidTransition);
			expect(result.success).toBe(false);
		});
	});

	describe('TechnologyHistorySchema', () => {
		it('should validate valid technology history', () => {
			const validHistory = {
				stageTransitions: [
					{
						originalStage: 'Hold',
						transitionDate: '2024-01-15T10:30:00Z',
						adrLink: 'https://example.com/adr/123',
					},
				],
				discoveryDate: '2024-01-01T00:00:00Z',
			};

			const result = TechnologyHistorySchema.safeParse(validHistory);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.stageTransitions).toHaveLength(1);
				expect(result.data.discoveryDate).toBeInstanceOf(Date);
			}
		});

		it('should validate empty stage transitions', () => {
			const validHistory = {
				stageTransitions: [],
				discoveryDate: '2024-01-01T00:00:00Z',
			};

			const result = TechnologyHistorySchema.safeParse(validHistory);
			expect(result.success).toBe(true);
		});
	});

	describe('TechnologySchema', () => {
		it('should validate a complete technology object', () => {
			const validTechnology = {
				name: 'React',
				category: 'Frameworks',
				stage: 'Adopt',
				tags: ['frontend', 'javascript'],
				detailsPage: 'https://react.dev',
				history: {
					stageTransitions: [
						{
							originalStage: 'Trial',
							transitionDate: '2024-01-15T10:30:00Z',
							adrLink: 'https://example.com/adr/123',
						},
					],
					discoveryDate: '2024-01-01T00:00:00Z',
				},
			};

			const result = TechnologySchema.safeParse(validTechnology);
			expect(result.success).toBe(true);
		});

		it('should validate technology with null detailsPage', () => {
			const validTechnology = {
				name: 'React',
				category: 'Frameworks',
				stage: 'Adopt',
				tags: ['frontend', 'javascript'],
				detailsPage: null,
				history: {
					stageTransitions: [],
					discoveryDate: '2024-01-01T00:00:00Z',
				},
			};

			const result = TechnologySchema.safeParse(validTechnology);
			expect(result.success).toBe(true);
		});

		it('should reject empty technology name', () => {
			const invalidTechnology = {
				name: '',
				category: 'Frameworks',
				stage: 'Adopt',
				tags: [],
				detailsPage: null,
				history: {
					stageTransitions: [],
					discoveryDate: '2024-01-01T00:00:00Z',
				},
			};

			const result = TechnologySchema.safeParse(invalidTechnology);
			expect(result.success).toBe(false);
		});

		it('should reject invalid category', () => {
			const invalidTechnology = {
				name: 'React',
				category: 'InvalidCategory',
				stage: 'Adopt',
				tags: [],
				detailsPage: null,
				history: {
					stageTransitions: [],
					discoveryDate: '2024-01-01T00:00:00Z',
				},
			};

			const result = TechnologySchema.safeParse(invalidTechnology);
			expect(result.success).toBe(false);
		});

		it('should reject invalid stage', () => {
			const invalidTechnology = {
				name: 'React',
				category: 'Frameworks',
				stage: 'InvalidStage',
				tags: [],
				detailsPage: null,
				history: {
					stageTransitions: [],
					discoveryDate: '2024-01-01T00:00:00Z',
				},
			};

			const result = TechnologySchema.safeParse(invalidTechnology);
			expect(result.success).toBe(false);
		});

		it('should reject invalid detailsPage URL', () => {
			const invalidTechnology = {
				name: 'React',
				category: 'Frameworks',
				stage: 'Adopt',
				tags: [],
				detailsPage: 'not-a-url',
				history: {
					stageTransitions: [],
					discoveryDate: '2024-01-01T00:00:00Z',
				},
			};

			const result = TechnologySchema.safeParse(invalidTechnology);
			expect(result.success).toBe(false);
		});
	});

	describe('TechnologyMetadataSchema', () => {
		it('should validate valid metadata', () => {
			const validMetadata = {
				total_count: 42,
				categories: ['Frameworks', 'Development Tools'],
				stages: ['Hold', 'Assess', 'Trial', 'Adopt'],
				available_tags: ['frontend', 'backend', 'database'],
			};

			const result = TechnologyMetadataSchema.safeParse(validMetadata);
			expect(result.success).toBe(true);
		});

		it('should reject negative total_count', () => {
			const invalidMetadata = {
				total_count: -1,
				categories: [],
				stages: [],
				available_tags: [],
			};

			const result = TechnologyMetadataSchema.safeParse(invalidMetadata);
			expect(result.success).toBe(false);
		});

		it('should reject non-integer total_count', () => {
			const invalidMetadata = {
				total_count: 42.5,
				categories: [],
				stages: [],
				available_tags: [],
			};

			const result = TechnologyMetadataSchema.safeParse(invalidMetadata);
			expect(result.success).toBe(false);
		});
	});

	describe('GetTechnologiesResponseSchema', () => {
		it('should validate complete API response', () => {
			const validResponse = {
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

			const result = GetTechnologiesResponseSchema.safeParse(validResponse);
			expect(result.success).toBe(true);
		});

		it('should validate empty response', () => {
			const validResponse = {
				technologies: [],
				metadata: {
					total_count: 0,
					categories: [],
					stages: [],
					available_tags: [],
				},
			};

			const result = GetTechnologiesResponseSchema.safeParse(validResponse);
			expect(result.success).toBe(true);
		});
	});

	describe('AddTechnologyRequestSchema', () => {
		it('should validate valid add request', () => {
			const validRequest = {
				name: 'Vue.js',
				category: 'Frameworks',
				stage: 'Trial',
				tags: ['frontend', 'javascript'],
				detailsPage: 'https://vuejs.org',
			};

			const result = AddTechnologyRequestSchema.safeParse(validRequest);
			expect(result.success).toBe(true);
		});

		it('should apply defaults for optional fields', () => {
			const minimalRequest = {
				name: 'Vue.js',
				category: 'Frameworks',
				stage: 'Trial',
			};

			const result = AddTechnologyRequestSchema.safeParse(minimalRequest);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.tags).toEqual([]);
				expect(result.data.detailsPage).toBe(null);
			}
		});

		it('should reject empty name', () => {
			const invalidRequest = {
				name: '',
				category: 'Frameworks',
				stage: 'Trial',
			};

			const result = AddTechnologyRequestSchema.safeParse(invalidRequest);
			expect(result.success).toBe(false);
		});

		it('should reject invalid category', () => {
			const invalidRequest = {
				name: 'Vue.js',
				category: 'InvalidCategory',
				stage: 'Trial',
			};

			const result = AddTechnologyRequestSchema.safeParse(invalidRequest);
			expect(result.success).toBe(false);
		});

		it('should reject invalid detailsPage URL', () => {
			const invalidRequest = {
				name: 'Vue.js',
				category: 'Frameworks',
				stage: 'Trial',
				detailsPage: 'not-a-url',
			};

			const result = AddTechnologyRequestSchema.safeParse(invalidRequest);
			expect(result.success).toBe(false);
		});
	});

	describe('UpdateTechnologyRequestSchema', () => {
		it('should validate valid update request', () => {
			const validRequest = {
				category: 'Frameworks',
				tags: ['frontend', 'javascript'],
				detailsPage: 'https://vuejs.org',
				stageTransition: {
					newStage: 'Adopt',
					adrLink: 'https://example.com/adr/456',
				},
			};

			const result = UpdateTechnologyRequestSchema.safeParse(validRequest);
			expect(result.success).toBe(true);
		});

		it('should validate update request without stage transition', () => {
			const validRequest = {
				category: 'Frameworks',
				tags: ['frontend'],
				detailsPage: null,
				stageTransition: null,
			};

			const result = UpdateTechnologyRequestSchema.safeParse(validRequest);
			expect(result.success).toBe(true);
		});

		it('should reject invalid stage transition', () => {
			const invalidRequest = {
				category: 'Frameworks',
				tags: [],
				detailsPage: null,
				stageTransition: {
					newStage: 'InvalidStage',
					adrLink: 'https://example.com/adr/456',
				},
			};

			const result = UpdateTechnologyRequestSchema.safeParse(invalidRequest);
			expect(result.success).toBe(false);
		});
	});

	describe('NewStageTransitionSchema', () => {
		it('should validate valid stage transition', () => {
			const validTransition = {
				newStage: 'Adopt',
				adrLink: 'https://example.com/adr/456',
			};

			const result = NewStageTransitionSchema.safeParse(validTransition);
			expect(result.success).toBe(true);
		});

		it('should reject invalid stage', () => {
			const invalidTransition = {
				newStage: 'InvalidStage',
				adrLink: 'https://example.com/adr/456',
			};

			const result = NewStageTransitionSchema.safeParse(invalidTransition);
			expect(result.success).toBe(false);
		});

		it('should reject invalid ADR URL', () => {
			const invalidTransition = {
				newStage: 'Adopt',
				adrLink: 'not-a-url',
			};

			const result = NewStageTransitionSchema.safeParse(invalidTransition);
			expect(result.success).toBe(false);
		});
	});

	describe('Constants validation', () => {
		it('should have correct categories', () => {
			expect(CATEGORIES).toEqual([
				'Observability',
				'Development Tools',
				'Frameworks',
				'Data Management',
			]);
		});

		it('should have correct stages', () => {
			expect(STAGES).toEqual(['Hold', 'Assess', 'Trial', 'Adopt']);
		});
	});
});
