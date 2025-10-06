import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Technology } from '../../../hooks/useTechnologies';
import ThoughtWorksRadar from '../ThoughtWorksRadar';

// Mock D3 to avoid complex DOM manipulation in tests
vi.mock('d3', () => {
	const mockArc = {
		innerRadius: vi.fn().mockReturnThis(),
		outerRadius: vi.fn().mockReturnThis(),
		startAngle: vi.fn().mockReturnThis(),
		endAngle: vi.fn().mockReturnThis(),
	};

	const mockSelection = {
		selectAll: vi.fn().mockReturnThis(),
		remove: vi.fn().mockReturnThis(),
		append: vi.fn().mockReturnThis(),
		attr: vi.fn().mockReturnThis(),
		style: vi.fn().mockReturnThis(),
		text: vi.fn().mockReturnThis(),
		on: vi.fn().mockReturnThis(),
	};

	return {
		select: vi.fn(() => mockSelection),
		arc: vi.fn(() => mockArc),
	};
});

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

describe('ThoughtWorksRadar', () => {
	const defaultProps = {
		technologies: mockTechnologies,
		onTechnologyClick: vi.fn(),
		onTechnologyHover: vi.fn(),
	};

	it('should render without crashing', () => {
		render(<ThoughtWorksRadar {...defaultProps} />);

		const container = document.querySelector('.thoughtworks-radar-container');
		expect(container).toBeInTheDocument();
	});

	it('should render with custom dimensions', () => {
		render(<ThoughtWorksRadar {...defaultProps} width={800} height={800} />);

		const svg = document.querySelector('.thoughtworks-radar');
		expect(svg).toHaveAttribute('width', '800');
		expect(svg).toHaveAttribute('height', '800');
	});

	it('should render with default dimensions when not provided', () => {
		render(<ThoughtWorksRadar {...defaultProps} />);

		const svg = document.querySelector('.thoughtworks-radar');
		expect(svg).toHaveAttribute('width', '1088');
		expect(svg).toHaveAttribute('height', '1088');
	});

	it('should handle empty technologies array', () => {
		render(<ThoughtWorksRadar {...defaultProps} technologies={[]} />);

		const container = document.querySelector('.thoughtworks-radar-container');
		expect(container).toBeInTheDocument();
	});

	it('should accept onTechnologyClick prop', () => {
		const onTechnologyClick = vi.fn();
		render(<ThoughtWorksRadar {...defaultProps} onTechnologyClick={onTechnologyClick} />);

		const container = document.querySelector('.thoughtworks-radar-container');
		expect(container).toBeInTheDocument();
	});

	it('should accept onTechnologyHover prop', () => {
		const onTechnologyHover = vi.fn();
		render(<ThoughtWorksRadar {...defaultProps} onTechnologyHover={onTechnologyHover} />);

		const container = document.querySelector('.thoughtworks-radar-container');
		expect(container).toBeInTheDocument();
	});

	it('should handle selectedTechnology prop', () => {
		const selectedTechnology = mockTechnologies[0];
		render(<ThoughtWorksRadar {...defaultProps} selectedTechnology={selectedTechnology} />);

		const container = document.querySelector('.thoughtworks-radar-container');
		expect(container).toBeInTheDocument();
	});

	it('should update when technologies prop changes', () => {
		const { rerender } = render(<ThoughtWorksRadar {...defaultProps} />);

		const newTechnologies = [createMockTechnology('Angular', 'Frameworks', 'Hold')];

		rerender(<ThoughtWorksRadar {...defaultProps} technologies={newTechnologies} />);

		const container = document.querySelector('.thoughtworks-radar-container');
		expect(container).toBeInTheDocument();
	});

	it('should have proper CSS classes and styling', () => {
		render(<ThoughtWorksRadar {...defaultProps} />);

		const container = document.querySelector('.thoughtworks-radar-container');
		const svg = document.querySelector('.thoughtworks-radar');

		expect(container).toBeInTheDocument();
		expect(svg).toBeInTheDocument();
		expect(svg).toHaveStyle('background: #fafafa');
	});

	it('should handle component unmounting gracefully', () => {
		const { unmount } = render(<ThoughtWorksRadar {...defaultProps} />);

		expect(() => {
			unmount();
		}).not.toThrow();
	});
});
