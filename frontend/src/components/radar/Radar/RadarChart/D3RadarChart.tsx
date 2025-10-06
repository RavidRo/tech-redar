import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import type { Technology } from '../../../../libraries/api/technologies';
import { calculateRadarPosition } from '../radarUtils';
import './RadarChart.css';

interface D3RadarChartProps {
	technologies: Technology[];
	selectedTechnology?: Technology;
	onTechnologyClick: (technology: Technology) => void;
	onTechnologyHover?: (technology: Technology | null) => void;
	width?: number;
	height?: number;
}

interface TechnologyWithPosition extends Technology {
	position: {
		x: number;
		y: number;
		angle: number;
		radius: number;
	};
}

const D3RadarChart: React.FC<D3RadarChartProps> = ({
	technologies,
	selectedTechnology,
	onTechnologyClick,
	onTechnologyHover,
	width = 600,
	height = 600,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const [hoveredTechnology, setHoveredTechnology] = useState<Technology | null>(null);

	// Configuration
	const centerX = width / 2;
	const centerY = height / 2;
	const maxRadius = Math.min(width, height) / 2 - 60; // Leave margin for labels

	// ThoughtWorks-style configuration
	const stageRings = React.useMemo(
		() => [
			{ stage: 'Adopt', radius: maxRadius * 0.25, color: '#8FA1B3' },
			{ stage: 'Trial', radius: maxRadius * 0.5, color: '#8FA1B3' },
			{ stage: 'Assess', radius: maxRadius * 0.75, color: '#8FA1B3' },
			{ stage: 'Hold', radius: maxRadius, color: '#8FA1B3' },
		],
		[maxRadius],
	);

	const categoryQuadrants = React.useMemo(
		() => [
			{
				category: 'Frameworks',
				startAngle: 0,
				endAngle: 90,
				dotColor: '#0DBD0D',
			},
			{
				category: 'Development Tools',
				startAngle: 90,
				endAngle: 180,
				dotColor: '#0F5BA7',
			},
			{
				category: 'Data Management',
				startAngle: 180,
				endAngle: 270,
				dotColor: '#B78900',
			},
			{
				category: 'Observability',
				startAngle: 270,
				endAngle: 360,
				dotColor: '#B32059',
			},
		],
		[],
	);

	// Get dot color and opacity based on category and stage
	const getDotColor = React.useCallback(
		(category: string, stage: string) => {
			const quadrant = categoryQuadrants.find((q) => q.category === category);
			const baseColor = quadrant?.dotColor ?? '#666';

			const stageOpacity =
				{
					Adopt: 1.0,
					Trial: 0.8,
					Assess: 0.6,
					Hold: 0.4,
				}[stage] ?? 0.6;

			return { color: baseColor, opacity: stageOpacity };
		},
		[categoryQuadrants],
	);

	// Convert polar to cartesian coordinates
	const polarToCartesian = React.useCallback(
		(angle: number, radius: number) => {
			const radians = (angle - 90) * (Math.PI / 180);
			return {
				x: centerX + radius * Math.cos(radians),
				y: centerY + radius * Math.sin(radians),
			};
		},
		[centerX, centerY],
	);

	// Prepare technology data with positions
	const technologiesWithPositions: TechnologyWithPosition[] = React.useMemo(() => {
		return technologies.map((tech) => {
			const position = calculateRadarPosition(tech, technologies);
			const cartesian = polarToCartesian(position.angle, position.radius * maxRadius);
			return {
				...tech,
				position: {
					...position,
					x: cartesian.x,
					y: cartesian.y,
				},
			};
		});
	}, [technologies, maxRadius, polarToCartesian]);

	useEffect(() => {
		if (!svgRef.current) return;

		const svg = d3.select(svgRef.current);
		svg.selectAll('*').remove(); // Clear previous render

		// Create main group
		const g = svg.append('g');

		// Background
		g.append('rect').attr('width', width).attr('height', height).attr('fill', '#FAFAFA');

		// Stage rings
		const ringsGroup = g.append('g').attr('class', 'rings');
		stageRings.forEach((ring) => {
			ringsGroup
				.append('circle')
				.attr('cx', centerX)
				.attr('cy', centerY)
				.attr('r', ring.radius)
				.attr('fill', 'none')
				.attr('stroke', ring.color)
				.attr('stroke-width', 1)
				.attr('stroke-opacity', 0.3);
		});

		// Quadrant divider lines
		const linesGroup = g.append('g').attr('class', 'divider-lines');
		[0, 90, 180, 270].forEach((angle) => {
			const end = polarToCartesian(angle, maxRadius);
			linesGroup
				.append('line')
				.attr('x1', centerX)
				.attr('y1', centerY)
				.attr('x2', end.x)
				.attr('y2', end.y)
				.attr('stroke', '#8FA1B3')
				.attr('stroke-width', 1)
				.attr('stroke-opacity', 0.4);
		});

		// Technology dots
		const dotsGroup = g.append('g').attr('class', 'technology-dots');

		const dots = dotsGroup
			.selectAll<SVGGElement, TechnologyWithPosition>('.technology-dot')
			.data(technologiesWithPositions, (d) => d.name);

		// Enter selection
		const dotsEnter = dots
			.enter()
			.append('g')
			.attr('class', 'technology-dot-group')
			.attr(
				'transform',
				(d) => `translate(${d.position.x.toString()}, ${d.position.y.toString()})`,
			);

		// Add shadow
		dotsEnter
			.append('circle')
			.attr('class', 'technology-dot-shadow')
			.attr('cx', 1)
			.attr('cy', 1)
			.attr('r', 6)
			.attr('fill', 'rgba(0,0,0,0.1)');

		// Add main dot
		dotsEnter
			.append('circle')
			.attr('class', 'technology-dot')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', 6)
			.attr('fill', (d) => getDotColor(d.category, d.stage).color)
			.attr('fill-opacity', (d) => getDotColor(d.category, d.stage).opacity)
			.attr('stroke', '#fff')
			.attr('stroke-width', 2)
			.style('cursor', 'pointer');

		// Add label background (initially hidden)
		dotsEnter
			.append('rect')
			.attr('class', 'technology-label-bg')
			.attr('x', (d) => -d.name.length * 3.5)
			.attr('y', -26)
			.attr('width', (d) => d.name.length * 7)
			.attr('height', 16)
			.attr('fill', 'rgba(255,255,255,0.9)')
			.attr('stroke', '#ccc')
			.attr('stroke-width', 1)
			.attr('rx', 3)
			.style('opacity', 0);

		// Add label text (initially hidden)
		dotsEnter
			.append('text')
			.attr('class', 'technology-label')
			.attr('x', 0)
			.attr('y', -14)
			.attr('text-anchor', 'middle')
			.attr('font-size', '11px')
			.attr('font-weight', '500')
			.attr('fill', '#333')
			.style('opacity', 0)
			.text((d) => d.name);

		// Merge enter and update selections
		const dotsUpdate = dotsEnter.merge(dots);

		// Update positions with animation
		dotsUpdate
			.transition()
			.duration(750)
			.attr(
				'transform',
				(d) => `translate(${d.position.x.toString()}, ${d.position.y.toString()})`,
			);

		// Update dot properties
		dotsUpdate
			.select('.technology-dot')
			.transition()
			.duration(300)
			.attr('r', (d) => {
				const isSelected = selectedTechnology?.name === d.name;
				const isHovered = hoveredTechnology?.name === d.name;
				return isSelected ? 10 : isHovered ? 8 : 6;
			})
			.attr('stroke', (d) => (selectedTechnology?.name === d.name ? '#333' : '#fff'))
			.attr('stroke-width', (d) => (selectedTechnology?.name === d.name ? 3 : 2));

		// Update shadow size
		dotsUpdate
			.select('.technology-dot-shadow')
			.transition()
			.duration(300)
			.attr('r', (d) => {
				const isSelected = selectedTechnology?.name === d.name;
				const isHovered = hoveredTechnology?.name === d.name;
				return isSelected ? 10 : isHovered ? 8 : 6;
			});

		// Show/hide labels based on hover/selection
		dotsUpdate
			.select('.technology-label-bg')
			.transition()
			.duration(200)
			.style('opacity', (d) => {
				const isSelected = selectedTechnology?.name === d.name;
				const isHovered = hoveredTechnology?.name === d.name;
				return isSelected || isHovered ? 1 : 0;
			});

		dotsUpdate
			.select('.technology-label')
			.transition()
			.duration(200)
			.style('opacity', (d) => {
				const isSelected = selectedTechnology?.name === d.name;
				const isHovered = hoveredTechnology?.name === d.name;
				return isSelected || isHovered ? 1 : 0;
			});

		// Event handlers
		dotsUpdate
			.on('mouseenter', function (_, d) {
				setHoveredTechnology(d);
				onTechnologyHover?.(d);

				// Immediate visual feedback
				d3.select(this).select('.technology-dot').transition().duration(150).attr('r', 8);
			})
			.on('mouseleave', function (_, d) {
				setHoveredTechnology(null);
				onTechnologyHover?.(null);

				// Reset size if not selected
				if (selectedTechnology?.name !== d.name) {
					d3.select(this).select('.technology-dot').transition().duration(150).attr('r', 6);
				}
			})
			.on('click', function (_, d) {
				onTechnologyClick(d);
			});

		// Exit selection
		dots.exit().remove();

		// Category labels - positioned outside quadrants
		const labelsGroup = g.append('g').attr('class', 'category-labels');

		const categoryLabels = [
			{
				text: 'Frameworks',
				x: centerX + maxRadius * 0.7,
				y: centerY - maxRadius - 15,
				anchor: 'middle',
			},
			{
				text: 'Development Tools',
				x: centerX + maxRadius + 15,
				y: centerY + 5,
				anchor: 'start',
			},
			{
				text: 'Data Management',
				x: centerX - maxRadius * 0.7,
				y: centerY + maxRadius + 25,
				anchor: 'middle',
			},
			{
				text: 'Observability',
				x: centerX - maxRadius - 15,
				y: centerY + 5,
				anchor: 'end',
			},
		];

		labelsGroup
			.selectAll('.category-label')
			.data(categoryLabels)
			.enter()
			.append('text')
			.attr('class', 'category-label')
			.attr('x', (d) => d.x)
			.attr('y', (d) => d.y)
			.attr('text-anchor', (d) => d.anchor)
			.attr('font-size', '14px')
			.attr('font-weight', '600')
			.attr('fill', '#666')
			.style('text-transform', 'uppercase')
			.style('letter-spacing', '0.5px')
			.text((d) => d.text);

		// Stage labels - positioned at bottom
		const stageLabelsGroup = g.append('g').attr('class', 'stage-labels');

		const stageLabels = [
			{ text: 'Adopt', x: centerX + maxRadius * 0.125 },
			{ text: 'Trial', x: centerX + maxRadius * 0.375 },
			{ text: 'Assess', x: centerX + maxRadius * 0.625 },
			{ text: 'Hold', x: centerX + maxRadius * 0.875 },
		];

		stageLabelsGroup
			.selectAll('.stage-label')
			.data(stageLabels)
			.enter()
			.append('text')
			.attr('class', 'stage-label')
			.attr('x', (d) => d.x)
			.attr('y', centerY + maxRadius + 15)
			.attr('text-anchor', 'middle')
			.attr('font-size', '11px')
			.attr('font-weight', '500')
			.attr('fill', '#999')
			.text((d) => d.text);
	}, [
		technologiesWithPositions,
		selectedTechnology,
		hoveredTechnology,
		width,
		height,
		centerX,
		centerY,
		maxRadius,
		onTechnologyClick,
		onTechnologyHover,
		getDotColor,
		polarToCartesian,
		stageRings,
	]);

	return (
		<div className="radar-chart-container">
			<svg ref={svgRef} width={width} height={height} className="radar-chart d3-radar-chart" />
		</div>
	);
};

export default D3RadarChart;
