import React, { useMemo, useState } from 'react';
import type { Technology } from '../../../../libraries/api/technologies/index.ts';
import { calculateRadarPosition } from '../radarUtils.ts';
import './RadarChart.css';

interface RadarChartProps {
	technologies: Technology[];
	selectedTechnology?: Technology;
	onTechnologyClick: (technology: Technology) => void;
	onTechnologyHover?: (technology: Technology | null) => void;
	width?: number;
	height?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({
	technologies,
	selectedTechnology,
	onTechnologyClick,
	onTechnologyHover,
	width = 600,
	height = 600,
}) => {
	const [hoveredTechnology, setHoveredTechnology] = useState<Technology | null>(null);

	// Calculate positions for all technologies
	const technologyPositions = useMemo(() => {
		return technologies.map((tech) => ({
			technology: tech,
			position: calculateRadarPosition(tech, technologies),
		}));
	}, [technologies]);

	// Radar configuration
	const centerX = width / 2;
	const centerY = height / 2;
	const maxRadius = Math.min(width, height) / 2 - 40; // Leave margin for labels

	// Stage rings configuration
	const stageRings = [
		{ stage: 'Adopt', radius: maxRadius * 0.25, color: '#4CAF50' },
		{ stage: 'Trial', radius: maxRadius * 0.5, color: '#FF9800' },
		{ stage: 'Assess', radius: maxRadius * 0.75, color: '#2196F3' },
		{ stage: 'Hold', radius: maxRadius, color: '#F44336' },
	];

	// Category quadrants configuration
	const categoryQuadrants = [
		{
			category: 'Frameworks',
			startAngle: 0,
			endAngle: 90,
			color: '#E3F2FD',
		},
		{
			category: 'Development Tools',
			startAngle: 90,
			endAngle: 180,
			color: '#F3E5F5',
		},
		{
			category: 'Data Management',
			startAngle: 180,
			endAngle: 270,
			color: '#E8F5E8',
		},
		{
			category: 'Observability',
			startAngle: 270,
			endAngle: 360,
			color: '#FFF3E0',
		},
	];

	const handleTechnologyHover = (technology: Technology | null) => {
		setHoveredTechnology(technology);
		if (onTechnologyHover) {
			onTechnologyHover(technology);
		}
	};

	const handleTechnologyClick = (technology: Technology) => {
		onTechnologyClick(technology);
	};

	// Convert polar coordinates to cartesian
	const polarToCartesian = (angle: number, radius: number) => {
		const radians = (angle - 90) * (Math.PI / 180);
		return {
			x: centerX + radius * Math.cos(radians),
			y: centerY + radius * Math.sin(radians),
		};
	};

	// Create path for quadrant sectors
	const createQuadrantPath = (startAngle: number, endAngle: number, radius: number) => {
		const start = polarToCartesian(startAngle, radius);
		const end = polarToCartesian(endAngle, radius);
		const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

		return [
			'M',
			centerX,
			centerY,
			'L',
			start.x,
			start.y,
			'A',
			radius,
			radius,
			0,
			largeArcFlag,
			1,
			end.x,
			end.y,
			'Z',
		].join(' ');
	};

	return (
		<div className="radar-chart-container">
			<svg width={width} height={height} className="radar-chart">
				{/* Background quadrants */}
				{categoryQuadrants.map((quadrant) => (
					<path
						key={quadrant.category}
						d={createQuadrantPath(quadrant.startAngle, quadrant.endAngle, maxRadius)}
						fill={quadrant.color}
						fillOpacity={0.1}
						stroke="none"
					/>
				))}

				{/* Stage rings */}
				{stageRings.map((ring) => (
					<circle
						key={ring.stage}
						cx={centerX}
						cy={centerY}
						r={ring.radius}
						fill="none"
						stroke={ring.color}
						strokeWidth={2}
						strokeOpacity={0.3}
					/>
				))}

				{/* Quadrant divider lines */}
				{[0, 90, 180, 270].map((angle) => {
					const end = polarToCartesian(angle, maxRadius);
					return (
						<line
							key={angle}
							x1={centerX}
							y1={centerY}
							x2={end.x}
							y2={end.y}
							stroke="#ccc"
							strokeWidth={1}
							strokeOpacity={0.5}
						/>
					);
				})}

				{/* Technology dots */}
				{technologyPositions.map(({ technology, position }) => {
					const cartesian = polarToCartesian(position.angle, position.radius * maxRadius);
					const isSelected = selectedTechnology?.name === technology.name;
					const isHovered = hoveredTechnology?.name === technology.name;
					const dotRadius = isSelected ? 8 : isHovered ? 6 : 4;

					return (
						<g key={technology.name}>
							<circle
								cx={cartesian.x}
								cy={cartesian.y}
								r={dotRadius}
								fill={stageRings.find((r) => r.stage === technology.stage)?.color ?? '#666'}
								stroke={isSelected ? '#000' : '#fff'}
								strokeWidth={isSelected ? 3 : 2}
								className="technology-dot"
								style={{ cursor: 'pointer' }}
								onMouseEnter={() => {
									handleTechnologyHover(technology);
								}}
								onMouseLeave={() => {
									handleTechnologyHover(null);
								}}
								onClick={() => {
									handleTechnologyClick(technology);
								}}
							/>
							{(isHovered || isSelected) && (
								<text
									x={cartesian.x}
									y={cartesian.y - dotRadius - 5}
									textAnchor="middle"
									fontSize="12"
									fill="#333"
									className="technology-label"
								>
									{technology.name}
								</text>
							)}
						</g>
					);
				})}

				{/* Stage labels */}
				{stageRings.map((ring) => (
					<text
						key={ring.stage}
						x={centerX + ring.radius - 10}
						y={centerY - 5}
						textAnchor="end"
						fontSize="14"
						fill={ring.color}
						fontWeight="bold"
						className="stage-label"
					>
						{ring.stage}
					</text>
				))}

				{/* Category labels */}
				{categoryQuadrants.map((quadrant) => {
					const labelAngle = (quadrant.startAngle + quadrant.endAngle) / 2;
					const labelPosition = polarToCartesian(labelAngle, maxRadius + 20);
					return (
						<text
							key={quadrant.category}
							x={labelPosition.x}
							y={labelPosition.y}
							textAnchor="middle"
							fontSize="16"
							fill="#333"
							fontWeight="bold"
							className="category-label"
						>
							{quadrant.category}
						</text>
					);
				})}
			</svg>
		</div>
	);
};

export default RadarChart;
