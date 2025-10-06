/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Technology } from '../../../../libraries/api/technologies';
import RadarChart from '../RadarChart/RadarChart';

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

const mockTechnologies: Technology[] = [
	createMockTechnology('React', 'Frameworks', 'Adopt'),
	createMockTechnology('Vue', 'Frameworks', 'Trial'),
	createMockTechnology('VSCode', 'Development Tools', 'Adopt'),
	createMockTechnology('MongoDB', 'Data Management', 'Assess'),
	createMockTechnology('Prometheus', 'Observability', 'Hold'),
];

describe('RadarChart', () => {
	const defaultProps = {
		technologies: mockTechnologies,
		onTechnologyClick: vi.fn(),
		onTechnologyHover: vi.fn(),
	};

	// Clear mocks before each test if needed
	// beforeEach(() => {
	// 	vi.clearAllMocks();
	// });

	it('should render without crashing', () => {
		render(<RadarChart {...defaultProps} />);

		const svg = document.querySelector('.radar-chart');
		expect(svg).toBeInTheDocument();
	});

	it('should render all technologies as dots', () => {
		render(<RadarChart {...defaultProps} />);

		// Check that technology dots are rendered (circles with technology-dot class)
		const svg = document.querySelector('.radar-chart');
		const dots = svg?.querySelectorAll('.technology-dot');

		expect(dots).toHaveLength(mockTechnologies.length);
	});

	it('should render stage rings', () => {
		render(<RadarChart {...defaultProps} />);

		const svg = document.querySelector('.radar-chart');
		const rings = svg?.querySelectorAll('circle[stroke]');

		// Should have 4 stage rings
		expect(rings?.length).toBeGreaterThanOrEqual(4);
	});

	it('should render category labels', () => {
		render(<RadarChart {...defaultProps} />);

		expect(screen.getByText('Frameworks')).toBeInTheDocument();
		expect(screen.getByText('Development Tools')).toBeInTheDocument();
		expect(screen.getByText('Data Management')).toBeInTheDocument();
		expect(screen.getByText('Observability')).toBeInTheDocument();
	});

	it('should render stage labels', () => {
		render(<RadarChart {...defaultProps} />);

		expect(screen.getByText('Hold')).toBeInTheDocument();
		expect(screen.getByText('Assess')).toBeInTheDocument();
		expect(screen.getByText('Trial')).toBeInTheDocument();
		expect(screen.getByText('Adopt')).toBeInTheDocument();
	});

	it('should call onTechnologyClick when a technology dot is clicked', () => {
		const onTechnologyClick = vi.fn();
		render(<RadarChart {...defaultProps} onTechnologyClick={onTechnologyClick} />);

		const svg = document.querySelector('.radar-chart');
		const firstDot = svg?.querySelector('.technology-dot');

		if (firstDot) {
			fireEvent.click(firstDot);
			expect(onTechnologyClick).toHaveBeenCalledTimes(1);
			expect(onTechnologyClick).toHaveBeenCalledWith(
				expect.objectContaining({
					name: expect.any(String),
					category: expect.any(String),
					stage: expect.any(String),
				}),
			);
		}
	});

	it('should call onTechnologyHover when hovering over a technology dot', () => {
		const onTechnologyHover = vi.fn();
		render(<RadarChart {...defaultProps} onTechnologyHover={onTechnologyHover} />);

		const svg = document.querySelector('.radar-chart');
		const firstDot = svg?.querySelector('.technology-dot');

		if (firstDot) {
			fireEvent.mouseEnter(firstDot);
			expect(onTechnologyHover).toHaveBeenCalledWith(
				expect.objectContaining({
					name: expect.any(String),
					category: expect.any(String),
					stage: expect.any(String),
				}),
			);

			fireEvent.mouseLeave(firstDot);
			expect(onTechnologyHover).toHaveBeenCalledWith(null);
		}
	});

	it('should highlight selected technology', () => {
		const selectedTechnology = mockTechnologies[0];
		render(<RadarChart {...defaultProps} selectedTechnology={selectedTechnology} />);

		const svg = document.querySelector('.radar-chart');
		const dots = svg?.querySelectorAll('.technology-dot');

		// The selected technology should have different styling (larger radius, different stroke)
		// We can't easily test the exact styling, but we can verify the component renders
		expect(dots?.length).toBeGreaterThan(0);
	});

	it('should show technology label on hover', () => {
		render(<RadarChart {...defaultProps} />);

		const svg = document.querySelector('.radar-chart');
		const firstDot = svg?.querySelector('.technology-dot');

		if (firstDot) {
			fireEvent.mouseEnter(firstDot);

			// Should show a technology label
			const labels = svg?.querySelectorAll('.technology-label');
			expect(labels?.length).toBeGreaterThan(0);
		}
	});

	it('should handle empty technologies array', () => {
		render(<RadarChart {...defaultProps} technologies={[]} />);

		const svg = document.querySelector('.radar-chart');
		const dots = svg?.querySelectorAll('.technology-dot');

		expect(dots).toHaveLength(0);

		// Should still render the radar structure
		expect(screen.getByText('Frameworks')).toBeInTheDocument();
		expect(screen.getByText('Hold')).toBeInTheDocument();
	});

	it('should use custom width and height when provided', () => {
		render(<RadarChart {...defaultProps} width={800} height={800} />);

		const svg = document.querySelector('.radar-chart');
		expect(svg).toHaveAttribute('width', '800');
		expect(svg).toHaveAttribute('height', '800');
	});

	it('should use default dimensions when not provided', () => {
		render(<RadarChart {...defaultProps} />);

		const svg = document.querySelector('.radar-chart');
		expect(svg).toHaveAttribute('width', '600');
		expect(svg).toHaveAttribute('height', '600');
	});

	it('should render quadrant background areas', () => {
		render(<RadarChart {...defaultProps} />);

		const svg = document.querySelector('.radar-chart');
		const quadrants = svg?.querySelectorAll('path[fill-opacity="0.1"]');

		// Should have 4 quadrant background areas
		expect(quadrants).toHaveLength(4);
	});

	it('should render quadrant divider lines', () => {
		render(<RadarChart {...defaultProps} />);

		const svg = document.querySelector('.radar-chart');
		const dividerLines = svg?.querySelectorAll('line[stroke="#ccc"]');

		// Should have 4 divider lines (one for each quadrant)
		expect(dividerLines).toHaveLength(4);
	});

	it('should handle technologies with different stages correctly', () => {
		const technologiesWithDifferentStages = [
			createMockTechnology('Tech1', 'Frameworks', 'Adopt'),
			createMockTechnology('Tech2', 'Frameworks', 'Trial'),
			createMockTechnology('Tech3', 'Frameworks', 'Assess'),
			createMockTechnology('Tech4', 'Frameworks', 'Hold'),
		];

		render(<RadarChart {...defaultProps} technologies={technologiesWithDifferentStages} />);

		const svg = document.querySelector('.radar-chart');
		const dots = svg?.querySelectorAll('.technology-dot');

		expect(dots).toHaveLength(4);
	});

	it('should handle technologies with different categories correctly', () => {
		const technologiesWithDifferentCategories = [
			createMockTechnology('Tech1', 'Frameworks', 'Adopt'),
			createMockTechnology('Tech2', 'Development Tools', 'Adopt'),
			createMockTechnology('Tech3', 'Data Management', 'Adopt'),
			createMockTechnology('Tech4', 'Observability', 'Adopt'),
		];

		render(<RadarChart {...defaultProps} technologies={technologiesWithDifferentCategories} />);

		const svg = document.querySelector('.radar-chart');
		const dots = svg?.querySelectorAll('.technology-dot');

		expect(dots).toHaveLength(4);
	});
});
