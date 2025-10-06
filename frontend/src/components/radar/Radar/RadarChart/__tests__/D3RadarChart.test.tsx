import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Technology } from '../../../../libraries/api/technologies';
import D3RadarChart from '../D3RadarChart';

// Mock D3 to avoid complex DOM manipulation in tests
vi.mock('d3', () => {
	const mockSelection = {
		selectAll: vi.fn().mockReturnThis(),
		remove: vi.fn().mockReturnThis(),
		append: vi.fn().mockReturnThis(),
		attr: vi.fn().mockReturnThis(),
		style: vi.fn().mockReturnThis(),
		text: vi.fn().mockReturnThis(),
		data: vi.fn().mockReturnThis(),
		enter: vi.fn().mockReturnThis(),
		merge: vi.fn().mockReturnThis(),
		exit: vi.fn().mockReturnThis(),
		transition: vi.fn().mockReturnThis(),
		duration: vi.fn().mockReturnThis(),
		on: vi.fn().mockReturnThis(),
		select: vi.fn().mockReturnThis(),
	};

	return {
		select: vi.fn(() => mockSelection),
	};
});

// Mock technology data for testing
const createMockTechnology = (
	name: string,
	category: 'Frameworks' | 'Development Tools' | 'Data Management' | 'Observability',
	stage: 'Hold' | 'Assess' | 'Trial' | 'Adopt'
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

describe('D3RadarChart', () => {
	const defaultProps = {
		technologies: mockTechnologies,
		onTechnologyClick: vi.fn(),
		onTechnologyHover: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render without crashing', () => {
		render(<D3RadarChart {...defaultProps} />);
		
		const svg = document.querySelector('.d3-radar-chart');
		expect(svg).toBeInTheDocument();
	});

	it('should render with custom dimensions', () => {
		render(<D3RadarChart {...defaultProps} width={800} height={800} />);
		
		const svg = document.querySelector('.d3-radar-chart');
		expect(svg).toHaveAttribute('width', '800');
		expect(svg).toHaveAttribute('height', '800');
	});

	it('should render with default dimensions when not provided', () => {
		render(<D3RadarChart {...defaultProps} />);
		
		const svg = document.querySelector('.d3-radar-chart');
		expect(svg).toHaveAttribute('width', '600');
		expect(svg).toHaveAttribute('height', '600');
	});

	it('should handle empty technologies array', () => {
		render(<D3RadarChart {...defaultProps} technologies={[]} />);
		
		const svg = document.querySelector('.d3-radar-chart');
		expect(svg).toBeInTheDocument();
	});

	it('should accept onTechnologyClick prop', () => {
		const onTechnologyClick = vi.fn();
		render(<D3RadarChart {...defaultProps} onTechnologyClick={onTechnologyClick} />);
		
		// Component should render without errors
		const svg = document.querySelector('.d3-radar-chart');
		expect(svg).toBeInTheDocument();
	});

	it('should accept onTechnologyHover prop', () => {
		const onTechnologyHover = vi.fn();
		render(<D3RadarChart {...defaultProps} onTechnologyHover={onTechnologyHover} />);
		
		// Component should render without errors
		const svg = document.querySelector('.d3-radar-chart');
		expect(svg).toBeInTheDocument();
	});

	it('should handle selectedTechnology prop', () => {
		const selectedTechnology = mockTechnologies[0];
		render(<D3RadarChart {...defaultProps} selectedTechnology={selectedTechnology} />);
		
		const svg = document.querySelector('.d3-radar-chart');
		expect(svg).toBeInTheDocument();
	});

	it('should update when technologies prop changes', () => {
		const { rerender } = render(<D3RadarChart {...defaultProps} />);
		
		const newTechnologies = [
			createMockTechnology('Angular', 'Frameworks', 'Hold'),
		];
		
		rerender(<D3RadarChart {...defaultProps} technologies={newTechnologies} />);
		
		// Component should re-render without errors
		const svg = document.querySelector('.d3-radar-chart');
		expect(svg).toBeInTheDocument();
	});

	it('should have proper CSS classes', () => {
		render(<D3RadarChart {...defaultProps} />);
		
		const container = document.querySelector('.radar-chart-container');
		const svg = document.querySelector('.d3-radar-chart');
		
		expect(container).toBeInTheDocument();
		expect(svg).toBeInTheDocument();
		expect(svg).toHaveClass('radar-chart');
		expect(svg).toHaveClass('d3-radar-chart');
	});

	it('should handle component unmounting gracefully', () => {
		const { unmount } = render(<D3RadarChart {...defaultProps} />);
		
		expect(() => { unmount(); }).not.toThrow();
	});

	it('should recalculate positions when technologies change', () => {
		const { rerender } = render(<D3RadarChart {...defaultProps} />);
		
		const newTechnologies = [
			...mockTechnologies,
			createMockTechnology('Svelte', 'Frameworks', 'Assess'),
		];
		
		rerender(<D3RadarChart {...defaultProps} technologies={newTechnologies} />);
		
		// Should not throw errors when recalculating positions
		const svg = document.querySelector('.d3-radar-chart');
		expect(svg).toBeInTheDocument();
	});
});