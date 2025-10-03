import { z } from 'zod';

// Constants for validation
export const CATEGORIES = [
	'Observability',
	'Development Tools',
	'Frameworks',
	'Data Management',
] as const;

export const STAGES = ['Hold', 'Assess', 'Trial', 'Adopt'] as const;

// ISO date format transformer
// TODO: Convert to z.iso.datetime
export const isoDateFormat = z
	.string()
	.refine((v) => !isNaN(Date.parse(v)), 'Invalid date')
	.transform((v) => new Date(v));

// Core schemas
export const StageTransitionSchema = z.object({
	originalStage: z.enum(STAGES),
	transitionDate: isoDateFormat,
	adrLink: z.url({ error: 'ADR link must be a valid URL' }),
});

export const TechnologyHistorySchema = z.object({
	stageTransitions: z.array(StageTransitionSchema),
	discoveryDate: isoDateFormat,
});

export const TechnologySchema = z.object({
	name: z.string().min(1, 'Technology name is required'),
	category: z.enum(CATEGORIES),
	stage: z.enum(STAGES),
	tags: z.array(z.string()),
	detailsPage: z.url({ error: 'Details page must be a valid URL' }).nullable(),
	history: TechnologyHistorySchema,
});

export const TechnologyMetadataSchema = z.object({
	total_count: z.number().int().min(0),
	categories: z.array(z.string()),
	stages: z.array(z.string()),
	available_tags: z.array(z.string()),
});

// API Response schemas
export const GetTechnologiesResponseSchema = z.object({
	technologies: z.array(TechnologySchema),
	metadata: TechnologyMetadataSchema,
});

// Request schemas
export const AddTechnologyRequestSchema = z.object({
	name: z.string().min(1, 'Technology name is required'),
	category: z.enum(CATEGORIES),
	stage: z.enum(STAGES),
	tags: z.array(z.string()).default([]),
	detailsPage: z.url({ error: 'Details page must be a valid URL' }).nullable().default(null),
});

export const NewStageTransitionSchema = z.object({
	newStage: z.enum(STAGES),
	adrLink: z.url({ error: 'ADR link must be a valid URL' }),
});

export const UpdateTechnologyRequestSchema = z.object({
	category: z.enum(CATEGORIES),
	tags: z.array(z.string()),
	detailsPage: z.url({ error: 'Details page must be a valid URL' }).nullable(),
	stageTransition: NewStageTransitionSchema.nullable(),
});

// Type exports for use in components
export type Technology = z.infer<typeof TechnologySchema>;
export type TechnologyHistory = z.infer<typeof TechnologyHistorySchema>;
export type StageTransition = z.infer<typeof StageTransitionSchema>;
export type TechnologyMetadata = z.infer<typeof TechnologyMetadataSchema>;
export type GetTechnologiesResponse = z.infer<typeof GetTechnologiesResponseSchema>;
export type AddTechnologyRequest = z.infer<typeof AddTechnologyRequestSchema>;
export type UpdateTechnologyRequest = z.infer<typeof UpdateTechnologyRequestSchema>;
export type NewStageTransition = z.infer<typeof NewStageTransitionSchema>;
export type Category = (typeof CATEGORIES)[number];
export type Stage = (typeof STAGES)[number];
