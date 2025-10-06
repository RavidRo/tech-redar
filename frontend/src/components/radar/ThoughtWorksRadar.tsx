import * as d3 from 'd3';
import React, { useEffect, useMemo, useRef } from 'react';
import type { Technology } from '../../hooks/useTechnologies';

interface ThoughtWorksRadarProps {
	technologies: Technology[];
	selectedTechnology?: Technology;
	onTechnologyClick: (technology: Technology) => void;
	onTechnologyHover?: (technology: Technology | null) => void;
	width?: number;
	height?: number;
}

interface RadarConfig {
	quadrantSize: number;
	quadrantGap: number;
	effectiveQuadrantHeight: number;
	effectiveQuadrantWidth: number;
	minBlipWidth: number;
	blipWidth: number;
	rings: string[];
	quadrants: string[];
}

interface QuadrantData {
	name: string;
	order: 'first' | 'second' | 'third' | 'fourth';
	startAngle: number;
	technologies: Technology[];
}

interface RingData {
	name: string;
	order: number;
	radius: number;
}

const ThoughtWorksRadar: React.FC<ThoughtWorksRadarProps> = ({
	technologies,
	selectedTechnology,
	onTechnologyClick,
	onTechnologyHover,
	width = 1088,
	height = 1088,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);

	// ThoughtWorks radar configuration
	const config: RadarConfig = useMemo(() => {
		const quadrantSize = 512;
		const quadrantGap = 32;
		return {
			quadrantSize,
			quadrantGap,
			effectiveQuadrantHeight: quadrantSize + quadrantGap / 2,
			effectiveQuadrantWidth: quadrantSize + quadrantGap / 2,
			minBlipWidth: 12,
			blipWidth: 22,
			rings: ['Adopt', 'Trial', 'Assess', 'Hold'],
			quadrants: ['Frameworks', 'Development Tools', 'Data Management', 'Observability'],
		};
	}, []);

	// Ring calculator - matches ThoughtWorks implementation
	const getRingRadius = React.useCallback(
		(ringIndex: number): number => {
			const ratios = [0, 0.316, 0.652, 0.832, 0.992];
			return (ratios[ringIndex] || 0) * config.quadrantSize;
		},
		[config.quadrantSize],
	);

	// Convert degrees to radians
	const toRadian = React.useCallback((degrees: number): number => {
		return (degrees * Math.PI) / 180;
	}, []);

	// Organize technologies by quadrants
	const quadrants: QuadrantData[] = useMemo(() => {
		const quadrantMap = {
			Frameworks: { order: 'first' as const, startAngle: 0 },
			'Development Tools': { order: 'second' as const, startAngle: 90 },
			'Data Management': { order: 'third' as const, startAngle: 180 },
			Observability: { order: 'fourth' as const, startAngle: 270 },
		};

		return Object.entries(quadrantMap).map(([name, { order, startAngle }]) => ({
			name,
			order,
			startAngle,
			technologies: technologies.filter((tech) => tech.category === name),
		}));
	}, [technologies]);

	// Ring data
	const rings: RingData[] = useMemo(() => {
		return config.rings.map((name, index) => ({
			name,
			order: index,
			radius: getRingRadius(index + 1),
		}));
	}, [config.rings, getRingRadius]);

	// Calculate blip coordinates using ThoughtWorks algorithm
	const calculateBlipCoordinates = React.useCallback(
		(
			technology: Technology,
			minRadius: number,
			maxRadius: number,
			startAngle: number,
			allCoordinates: { x: number; y: number; width: number }[],
		): { x: number; y: number } => {
			const adjustX = Math.sin(toRadian(startAngle)) - Math.cos(toRadian(startAngle));
			const adjustY = -Math.cos(toRadian(startAngle)) - Math.sin(toRadian(startAngle));

			// Create deterministic random based on technology name
			const seed = technology.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
			const random = () => {
				const x = Math.sin(seed) * 10000;
				return x - Math.floor(x);
			};

			const blipWidth = config.blipWidth;
			const radius = minRadius + random() * (maxRadius - minRadius - blipWidth);

			let angleDelta = (Math.asin(blipWidth / 2 / radius) * 180) / (Math.PI - 1.25);
			angleDelta = angleDelta > 45 ? 45 : angleDelta;
			const angle = toRadian(angleDelta + random() * (90 - 2 * angleDelta));

			let x = config.effectiveQuadrantWidth + radius * Math.cos(angle) * adjustX;
			let y = config.effectiveQuadrantHeight + radius * Math.sin(angle) * adjustY;

			// Simple collision avoidance
			const maxAttempts = 10;
			let attempts = 0;
			while (attempts < maxAttempts) {
				const hasCollision = allCoordinates.some(
					(coord) =>
						Math.abs(coord.x - x) < (coord.width + blipWidth) / 2 + 5 &&
						Math.abs(coord.y - y) < (coord.width + blipWidth) / 2 + 5,
				);

				if (!hasCollision) break;

				// Adjust position slightly
				x += (random() - 0.5) * 20;
				y += (random() - 0.5) * 20;
				attempts++;
			}

			return { x, y };
		},
		[config.blipWidth, config.effectiveQuadrantWidth, config.effectiveQuadrantHeight, toRadian],
	);

	// Get blip color based on stage
	const getBlipColor = (stage: string): string => {
		const colors = {
			Adopt: '#0DBD0D',
			Trial: '#0F5BA7',
			Assess: '#B78900',
			Hold: '#B32059',
		};
		return colors[stage as keyof typeof colors] || '#666';
	};

	// Check if technology is new (for demo purposes, we'll use a simple heuristic)
	const isNewTechnology = (technology: Technology): boolean => {
		// In a real implementation, this would check the technology's history
		return technology.history.stageTransitions.length === 0;
	};

	useEffect(() => {
		if (!svgRef.current) return;

		const svg = d3.select(svgRef.current);
		svg.selectAll('*').remove();

		// Set up the main group
		const mainGroup = svg.append('g');

		// Draw background
		mainGroup.append('rect').attr('width', width).attr('height', height).attr('fill', '#fafafa');

		// Draw quadrants
		quadrants.forEach((quadrant) => {
			const quadrantGroup = mainGroup
				.append('g')
				.attr('class', `quadrant-group quadrant-group-${quadrant.order}`)
				.style('cursor', 'pointer');

			// Quadrant background rectangle
			const rectCoords = {
				first: { x: 0, y: 0 },
				second: { x: 0, y: config.quadrantSize + config.quadrantGap },
				third: { x: config.quadrantSize + config.quadrantGap, y: 0 },
				fourth: {
					x: config.quadrantSize + config.quadrantGap,
					y: config.quadrantSize + config.quadrantGap,
				},
			};

			quadrantGroup
				.append('rect')
				.attr('width', config.quadrantSize)
				.attr('height', config.quadrantSize)
				.attr('fill', '#edf1f3')
				.attr('x', rectCoords[quadrant.order].x)
				.attr('y', rectCoords[quadrant.order].y)
				.style('pointer-events', 'none');

			// Draw rings for this quadrant
			rings.forEach((ring, i) => {
				const arc = d3
					.arc()
					.innerRadius(getRingRadius(i))
					.outerRadius(getRingRadius(i + 1))
					.startAngle(toRadian(quadrant.startAngle))
					.endAngle(toRadian(quadrant.startAngle - 90));

				quadrantGroup
					.append('path')
					.attr('d', () => arc(null))
					.attr('class', `ring-arc-${ring.order}`)
					.attr('fill', 'none')
					.attr('stroke', '#ccc')
					.attr('stroke-width', 1)
					.attr('stroke-opacity', 0.5)
					.attr(
						'transform',
						`translate(${String(config.effectiveQuadrantWidth)}, ${String(config.effectiveQuadrantHeight)})`,
					);
			});

			// Draw quadrant border
			quadrantGroup
				.append('rect')
				.attr('width', config.quadrantSize)
				.attr('height', config.quadrantSize)
				.attr('fill', 'transparent')
				.attr('stroke', '#71777d')
				.attr('stroke-width', 2)
				.attr('x', rectCoords[quadrant.order].x)
				.attr('y', rectCoords[quadrant.order].y);

			// Add quadrant label
			const labelPosition = {
				first: { x: config.quadrantSize / 2, y: 30 },
				second: { x: config.quadrantSize / 2, y: config.quadrantSize + config.quadrantGap + 30 },
				third: { x: config.quadrantSize + config.quadrantGap + config.quadrantSize / 2, y: 30 },
				fourth: {
					x: config.quadrantSize + config.quadrantGap + config.quadrantSize / 2,
					y: config.quadrantSize + config.quadrantGap + 30,
				},
			};

			quadrantGroup
				.append('text')
				.attr('x', labelPosition[quadrant.order].x)
				.attr('y', labelPosition[quadrant.order].y)
				.attr('text-anchor', 'middle')
				.attr('font-size', '16px')
				.attr('font-weight', 'bold')
				.attr('fill', '#333')
				.text(quadrant.name);

			// Plot technologies (blips) for this quadrant
			const allCoordinates: { x: number; y: number; width: number }[] = [];

			rings.forEach((ring, ringIndex) => {
				const ringTechnologies = quadrant.technologies.filter((tech) => tech.stage === ring.name);

				if (ringTechnologies.length === 0) return;

				const minRadius = getRingRadius(ringIndex) + 10;
				const maxRadius = getRingRadius(ringIndex + 1) - 10;

				ringTechnologies.forEach((technology) => {
					const coords = calculateBlipCoordinates(
						technology,
						minRadius,
						maxRadius,
						quadrant.startAngle,
						allCoordinates,
					);

					allCoordinates.push({ x: coords.x, y: coords.y, width: config.blipWidth });

					const blipGroup = quadrantGroup
						.append('g')
						.attr('class', 'blip-link')
						.attr(
							'transform',
							`translate(${(coords.x - 16).toString()}, ${(coords.y - 16).toString()})`,
						)
						.style('cursor', 'pointer');

					const isSelected = selectedTechnology?.name === technology.name;
					const isNew = isNewTechnology(technology);

					// Draw blip shape
					if (isNew) {
						// Triangle for new technologies
						blipGroup
							.append('path')
							.attr('d', 'M16 4 L28 28 L4 28 Z')
							.attr('fill', getBlipColor(technology.stage))
							.attr('stroke', isSelected ? '#333' : '#fff')
							.attr('stroke-width', isSelected ? 3 : 2);
					} else {
						// Circle for existing technologies
						blipGroup
							.append('circle')
							.attr('cx', 16)
							.attr('cy', 16)
							.attr('r', 12)
							.attr('fill', getBlipColor(technology.stage))
							.attr('stroke', isSelected ? '#333' : '#fff')
							.attr('stroke-width', isSelected ? 3 : 2);
					}

					// Add technology number/text
					blipGroup
						.append('text')
						.attr('x', 16)
						.attr('y', 21)
						.attr('text-anchor', 'middle')
						.attr('font-size', '10px')
						.attr('font-weight', 'bold')
						.attr('fill', 'white')
						.text(technology.name.substring(0, 2).toUpperCase());

					// Add event handlers
					blipGroup
						.on('mouseenter', () => {
							onTechnologyHover?.(technology);
						})
						.on('mouseleave', () => {
							onTechnologyHover?.(null);
						})
						.on('click', () => {
							onTechnologyClick(technology);
						});
				});
			});

			// Add ring labels
			rings.forEach((ring, i) => {
				const labelRadius = (getRingRadius(i) + getRingRadius(i + 1)) / 2;
				let labelX, labelY;

				if (quadrant.order === 'first' || quadrant.order === 'fourth') {
					labelX = config.effectiveQuadrantWidth + labelRadius;
					labelY = config.effectiveQuadrantHeight + 4;
				} else {
					labelX = config.effectiveQuadrantWidth - labelRadius;
					labelY = config.effectiveQuadrantHeight + 4;
				}

				quadrantGroup
					.append('text')
					.attr('x', labelX)
					.attr('y', labelY)
					.attr('text-anchor', 'middle')
					.attr('font-size', '12px')
					.attr('fill', '#666')
					.text(ring.name);
			});
		});

		// Add center lines
		mainGroup
			.append('line')
			.attr('x1', config.effectiveQuadrantWidth)
			.attr('y1', 0)
			.attr('x2', config.effectiveQuadrantWidth)
			.attr('y2', height)
			.attr('stroke', '#71777d')
			.attr('stroke-width', 2);

		mainGroup
			.append('line')
			.attr('x1', 0)
			.attr('y1', config.effectiveQuadrantHeight)
			.attr('x2', width)
			.attr('y2', config.effectiveQuadrantHeight)
			.attr('stroke', '#71777d')
			.attr('stroke-width', 2);
	}, [
		technologies,
		selectedTechnology,
		quadrants,
		rings,
		config,
		width,
		height,
		onTechnologyClick,
		onTechnologyHover,
		calculateBlipCoordinates,
		getRingRadius,
		toRadian,
	]);

	return (
		<div
			className="thoughtworks-radar-container"
			style={{ display: 'flex', justifyContent: 'center' }}
		>
			<svg
				ref={svgRef}
				width={width}
				height={height}
				className="thoughtworks-radar"
				style={{ background: '#fafafa', border: '1px solid #ddd', borderRadius: '4px' }}
			/>
		</div>
	);
};

export default ThoughtWorksRadar;
