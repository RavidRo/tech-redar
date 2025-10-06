import { describe, expect, it } from 'vitest';
import type { Technology } from '../../../../libraries/api/technologies';
import {
	calculateRadarPosition,
	getAvailableCategories,
	getAvailableStages,
	getStageColor,
	polarToCartesian,
} from '../radarUtils';

// Mock technology data for testing
const createMockTechnology = (
	name: string,
	category: 'Frameworks' | 'Development Tools' | 'Data Management' | 'Observability',
	stage: 'Hold' | 'Assess' | 'Trial' | 'Adopt',
): Technology => ({
	name,
	category,
	stage,
	tags: [],
	detailsPage: null,
	history: {
		discoveryDate: new Date('2024-01-01'),
		stageTransitions: [],
	},
});

describe('radarUtils', () => {
	describe('calculateRadarPosition', () => {
		it('should return consistent positions for the same technology', () => {
			const tech = createMockTechnology('React', 'Frameworks', 'Adopt');
			const technologies = [tech];

			const position1 = calculateRadarPosition(tech, technologies);
			const position2 = calculateRadarPosition(tech, technologies);

			expect(position1.angle).toBe(position2.angle);
			expect(position1.radius).toBe(position2.radius);
		});

		it('should place technologies in correct category quadrants', () => {
			const frameworks = createMockTechnology('React', 'Frameworks', 'Adopt');
			const devTools = createMockTechnology('VSCode', 'Development Tools', 'Adopt');
			const dataManagement = createMockTechnology('MongoDB', 'Data Management', 'Adopt');
			const observability = createMockTechnology('Prometheus', 'Observability', 'Adopt');

			const technologies = [frameworks, devTools, dataManagement, observability];

			const frameworksPos = calculateRadarPosition(frameworks, technologies);
			const devToolsPos = calculateRadarPosition(devTools, technologies);
			const dataManagementPos = calculateRadarPosition(dataManagement, technologies);
			const observabilityPos = calculateRadarPosition(observability, technologies);

			// Frameworks: 0-90 degrees
			expect(frameworksPos.angle).toBeGreaterThanOrEqual(0);
			expect(frameworksPos.angle).toBeLessThanOrEqual(90);

			// Development Tools: 90-180 degrees
			expect(devToolsPos.angle).toBeGreaterThanOrEqual(90);
			expect(devToolsPos.angle).toBeLessThanOrEqual(180);

			// Data Management: 180-270 degrees
			expect(dataManagementPos.angle).toBeGreaterThanOrEqual(180);
			expect(dataManagementPos.angle).toBeLessThanOrEqual(270);

			// Observability: 270-360 degrees
			expect(observabilityPos.angle).toBeGreaterThanOrEqual(270);
			expect(observabilityPos.angle).toBeLessThanOrEqual(360);
		});

		it('should place technologies in correct stage rings', () => {
			const adoptTech = createMockTechnology('React', 'Frameworks', 'Adopt');
			const trialTech = createMockTechnology('Vue', 'Frameworks', 'Trial');
			const assessTech = createMockTechnology('Svelte', 'Frameworks', 'Assess');
			const holdTech = createMockTechnology('Angular', 'Frameworks', 'Hold');

			const technologies = [adoptTech, trialTech, assessTech, holdTech];

			const adoptPos = calculateRadarPosition(adoptTech, technologies);
			const trialPos = calculateRadarPosition(trialTech, technologies);
			const assessPos = calculateRadarPosition(assessTech, technologies);
			const holdPos = calculateRadarPosition(holdTech, technologies);

			// Adopt should be innermost (0.1-0.25)
			expect(adoptPos.radius).toBeGreaterThanOrEqual(0.1);
			expect(adoptPos.radius).toBeLessThanOrEqual(0.25);

			// Trial should be second ring (0.25-0.5)
			expect(trialPos.radius).toBeGreaterThanOrEqual(0.25);
			expect(trialPos.radius).toBeLessThanOrEqual(0.5);

			// Assess should be third ring (0.5-0.75)
			expect(assessPos.radius).toBeGreaterThanOrEqual(0.5);
			expect(assessPos.radius).toBeLessThanOrEqual(0.75);

			// Hold should be outermost (0.75-1.0)
			expect(holdPos.radius).toBeGreaterThanOrEqual(0.75);
			expect(holdPos.radius).toBeLessThanOrEqual(1.0);
		});

		it('should handle collision detection for overlapping technologies', () => {
			// Create multiple technologies with the same category and stage
			const tech1 = createMockTechnology('Tech1', 'Frameworks', 'Adopt');
			const tech2 = createMockTechnology('Tech2', 'Frameworks', 'Adopt');
			const tech3 = createMockTechnology('Tech3', 'Frameworks', 'Adopt');

			const technologies = [tech1, tech2, tech3];

			const pos1 = calculateRadarPosition(tech1, technologies);
			const pos2 = calculateRadarPosition(tech2, technologies);
			const pos3 = calculateRadarPosition(tech3, technologies);

			// Positions should be different to avoid overlap
			expect(pos1.angle).not.toBe(pos2.angle);
			expect(pos1.angle).not.toBe(pos3.angle);
			expect(pos2.angle).not.toBe(pos3.angle);
		});

		it('should return valid position properties', () => {
			const tech = createMockTechnology('React', 'Frameworks', 'Adopt');
			const technologies = [tech];

			const position = calculateRadarPosition(tech, technologies);

			expect(typeof position.angle).toBe('number');
			expect(typeof position.radius).toBe('number');
			expect(typeof position.x).toBe('number');
			expect(typeof position.y).toBe('number');

			expect(position.angle).toBeGreaterThanOrEqual(0);
			expect(position.angle).toBeLessThanOrEqual(360);
			expect(position.radius).toBeGreaterThanOrEqual(0);
			expect(position.radius).toBeLessThanOrEqual(1);
		});
	});

	describe('polarToCartesian', () => {
		it('should convert polar coordinates to cartesian correctly', () => {
			const centerX = 300;
			const centerY = 300;
			const angle = 0; // 0 degrees (pointing up due to -90 offset)
			const radius = 0.5; // Half radius
			const maxRadius = 200;

			const result = polarToCartesian(centerX, centerY, angle, radius, maxRadius);

			// At 0 degrees with -90 offset, should be directly up
			expect(result.x).toBeCloseTo(centerX); // No horizontal offset
			expect(result.y).toBeCloseTo(centerY - 100); // centerY - (0.5 * 200)
		});

		it('should handle 90-degree angle correctly', () => {
			const centerX = 300;
			const centerY = 300;
			const angle = 90; // 90 degrees (pointing right due to -90 offset)
			const radius = 0.5;
			const maxRadius = 200;

			const result = polarToCartesian(centerX, centerY, angle, radius, maxRadius);

			// At 90 degrees with -90 offset, should be directly right
			expect(result.x).toBeCloseTo(centerX + 100); // centerX + (0.5 * 200)
			expect(result.y).toBeCloseTo(centerY); // No vertical offset
		});

		it('should handle different radius values', () => {
			const centerX = 300;
			const centerY = 300;
			const angle = 0; // Points up with -90 offset
			const maxRadius = 200;

			const result1 = polarToCartesian(centerX, centerY, angle, 0.25, maxRadius);
			const result2 = polarToCartesian(centerX, centerY, angle, 0.75, maxRadius);

			expect(result1.y).toBeCloseTo(centerY - 50); // 0.25 * 200 up
			expect(result2.y).toBeCloseTo(centerY - 150); // 0.75 * 200 up
		});
	});

	describe('getStageColor', () => {
		it('should return correct colors for each stage', () => {
			expect(getStageColor('Adopt')).toBe('#4CAF50');
			expect(getStageColor('Trial')).toBe('#FF9800');
			expect(getStageColor('Assess')).toBe('#2196F3');
			expect(getStageColor('Hold')).toBe('#F44336');
		});

		it('should return default color for invalid stage', () => {
			// @ts-expect-error Testing invalid input
			expect(getStageColor('InvalidStage')).toBe('#666');
		});
	});

	describe('getAvailableCategories', () => {
		it('should return all available categories', () => {
			const categories = getAvailableCategories();

			expect(categories).toContain('Frameworks');
			expect(categories).toContain('Development Tools');
			expect(categories).toContain('Data Management');
			expect(categories).toContain('Observability');
			expect(categories).toHaveLength(4);
		});

		it('should return a new array each time', () => {
			const categories1 = getAvailableCategories();
			const categories2 = getAvailableCategories();

			expect(categories1).not.toBe(categories2); // Different array instances
			expect(categories1).toEqual(categories2); // Same content
		});
	});

	describe('getAvailableStages', () => {
		it('should return all available stages', () => {
			const stages = getAvailableStages();

			expect(stages).toContain('Hold');
			expect(stages).toContain('Assess');
			expect(stages).toContain('Trial');
			expect(stages).toContain('Adopt');
			expect(stages).toHaveLength(4);
		});

		it('should return a new array each time', () => {
			const stages1 = getAvailableStages();
			const stages2 = getAvailableStages();

			expect(stages1).not.toBe(stages2); // Different array instances
			expect(stages1).toEqual(stages2); // Same content
		});
	});
});
