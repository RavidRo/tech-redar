import type { Category, Stage, Technology } from '../../../libraries/api/technologies';
import { CATEGORIES, STAGES } from '../../../libraries/api/technologies';

export interface RadarPosition {
	x: number;
	y: number;
	angle: number;
	radius: number;
}

// Category to angle mapping (in degrees)
const CATEGORY_ANGLES: Record<Category, { start: number; end: number }> = {
	Frameworks: { start: 0, end: 90 },
	'Development Tools': { start: 90, end: 180 },
	'Data Management': { start: 180, end: 270 },
	Observability: { start: 270, end: 360 },
};

// Stage to radius mapping (normalized 0-1)
const STAGE_RADII: Record<Stage, { inner: number; outer: number }> = {
	Adopt: { inner: 0.1, outer: 0.25 },
	Trial: { inner: 0.25, outer: 0.5 },
	Assess: { inner: 0.5, outer: 0.75 },
	Hold: { inner: 0.75, outer: 1.0 },
};

/**
 * Generates a deterministic pseudo-random number based on a string seed
 */
function seededRandom(seed: string, min = 0, max = 1): number {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		const char = seed.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	// Normalize hash to 0-1 range
	const normalized = Math.abs(hash) / 2147483647;
	return min + normalized * (max - min);
}

/**
 * Calculates the distance between two points in polar coordinates
 */
function polarDistance(pos1: RadarPosition, pos2: RadarPosition): number {
	// Convert to cartesian for distance calculation
	const x1 = pos1.radius * Math.cos((pos1.angle * Math.PI) / 180);
	const y1 = pos1.radius * Math.sin((pos1.angle * Math.PI) / 180);
	const x2 = pos2.radius * Math.cos((pos2.angle * Math.PI) / 180);
	const y2 = pos2.radius * Math.sin((pos2.angle * Math.PI) / 180);

	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Checks if two positions are too close (collision detection)
 */
function hasCollision(pos1: RadarPosition, pos2: RadarPosition, minDistance = 0.08): boolean {
	return polarDistance(pos1, pos2) < minDistance;
}

/**
 * Adjusts position to avoid collisions with existing positions
 */
function adjustForCollisions(
	basePosition: RadarPosition,
	existingPositions: RadarPosition[],
	category: Category,
	stage: Stage,
	maxAttempts = 20,
): RadarPosition {
	let position = { ...basePosition };
	const categoryBounds = CATEGORY_ANGLES[category];
	const stageBounds = STAGE_RADII[stage];

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const hasAnyCollision = existingPositions.some((existing) => hasCollision(position, existing));

		if (!hasAnyCollision) {
			return position;
		}

		// Try a new position with slight variations
		const angleVariation = (attempt + 1) * 5; // Increase variation with attempts
		const radiusVariation = (attempt + 1) * 0.02;

		// Alternate between positive and negative variations
		const angleSign = attempt % 2 === 0 ? 1 : -1;
		const radiusSign = Math.floor(attempt / 2) % 2 === 0 ? 1 : -1;

		let newAngle = basePosition.angle + angleSign * angleVariation;
		let newRadius = basePosition.radius + radiusSign * radiusVariation;

		// Ensure we stay within category bounds
		newAngle = Math.max(categoryBounds.start + 5, Math.min(categoryBounds.end - 5, newAngle));

		// Ensure we stay within stage bounds
		newRadius = Math.max(stageBounds.inner + 0.05, Math.min(stageBounds.outer - 0.05, newRadius));

		position = { ...position, angle: newAngle, radius: newRadius };
	}

	// If we couldn't find a collision-free position, return the last attempt
	return position;
}

/**
 * Calculates the radar position for a technology
 */
export function calculateRadarPosition(
	technology: Technology,
	allTechnologies: Technology[],
): RadarPosition {
	const categoryBounds = CATEGORY_ANGLES[technology.category];
	const stageBounds = STAGE_RADII[technology.stage];

	// Generate deterministic position based on technology name
	const baseAngle =
		categoryBounds.start +
		seededRandom(
			technology.name + technology.category,
			5, // Add some padding from edges
			categoryBounds.end - categoryBounds.start - 5,
		);

	const baseRadius =
		stageBounds.inner +
		seededRandom(
			technology.name + technology.stage,
			0.05, // Add some padding from inner edge
			stageBounds.outer - stageBounds.inner - 0.05,
		);

	const basePosition: RadarPosition = {
		x: 0, // Will be calculated in component
		y: 0, // Will be calculated in component
		angle: baseAngle,
		radius: baseRadius,
	};

	// Calculate positions for technologies that come before this one (for collision detection)
	const technologiesBeforeThis = allTechnologies.slice(0, allTechnologies.indexOf(technology));
	const existingPositions: RadarPosition[] = technologiesBeforeThis.map((tech) => {
		const catBounds = CATEGORY_ANGLES[tech.category];
		const stgBounds = STAGE_RADII[tech.stage];

		return {
			x: 0,
			y: 0,
			angle:
				catBounds.start +
				seededRandom(tech.name + tech.category, 5, catBounds.end - catBounds.start - 5),
			radius:
				stgBounds.inner +
				seededRandom(tech.name + tech.stage, 0.05, stgBounds.outer - stgBounds.inner - 0.05),
		};
	});

	// Adjust position to avoid collisions
	return adjustForCollisions(
		basePosition,
		existingPositions,
		technology.category,
		technology.stage,
	);
}

/**
 * Converts polar coordinates to cartesian coordinates
 */
export function polarToCartesian(
	centerX: number,
	centerY: number,
	angle: number,
	radius: number,
	maxRadius: number,
): { x: number; y: number } {
	const radians = (angle - 90) * (Math.PI / 180);
	const actualRadius = radius * maxRadius;

	return {
		x: centerX + actualRadius * Math.cos(radians),
		y: centerY + actualRadius * Math.sin(radians),
	};
}

/**
 * Gets the color for a stage
 */
export function getStageColor(stage: Stage): string {
	const stageColors: Record<Stage, string> = {
		Adopt: '#4CAF50',
		Trial: '#FF9800',
		Assess: '#2196F3',
		Hold: '#F44336',
	};

	return stageColors[stage] || '#666';
}

/**
 * Gets all available categories
 */
export function getAvailableCategories(): Category[] {
	return [...CATEGORIES];
}

/**
 * Gets all available stages
 */
export function getAvailableStages(): Stage[] {
	return [...STAGES];
}
