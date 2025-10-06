import React, { useState } from 'react';
import type { Technology } from '../../../../libraries/api/technologies';
import D3RadarChart from './D3RadarChart';

interface D3RadarChartDemoProps {
	technologies: Technology[];
}

const D3RadarChartDemo: React.FC<D3RadarChartDemoProps> = ({ technologies }) => {
	const [selectedTechnology, setSelectedTechnology] = useState<Technology | undefined>();
	const [hoveredTechnology, setHoveredTechnology] = useState<Technology | null>(null);

	const handleTechnologyClick = (technology: Technology) => {
		setSelectedTechnology(technology);
		console.log('Technology clicked:', technology.name);
	};

	const handleTechnologyHover = (technology: Technology | null) => {
		setHoveredTechnology(technology);
		if (technology) {
			console.log('Technology hovered:', technology.name);
		}
	};

	return (
		<div style={{ width: '100%', height: '700px' }}>
			<h2>Tech Radar Visualization (D3.js)</h2>
			{hoveredTechnology && (
				<div
					style={{
						marginBottom: '10px',
						padding: '10px',
						backgroundColor: '#f0f0f0',
						borderRadius: '4px',
						border: '1px solid #ddd',
					}}
				>
					<strong>Hovered:</strong> {hoveredTechnology.name} ({hoveredTechnology.category} -{' '}
					{hoveredTechnology.stage})
				</div>
			)}
			{selectedTechnology && (
				<div
					style={{
						marginBottom: '10px',
						padding: '15px',
						backgroundColor: '#e6f7ff',
						borderRadius: '4px',
						border: '1px solid #91d5ff',
					}}
				>
					<strong>Selected:</strong> {selectedTechnology.name}
					<br />
					<strong>Category:</strong> {selectedTechnology.category}
					<br />
					<strong>Stage:</strong> {selectedTechnology.stage}
					<br />
					<strong>Tags:</strong> {selectedTechnology.tags.join(', ') || 'None'}
					{selectedTechnology.detailsPage && (
						<>
							<br />
							<strong>Details:</strong>{' '}
							<a
								href={selectedTechnology.detailsPage}
								target="_blank"
								rel="noopener noreferrer"
								style={{ color: '#1890ff' }}
							>
								View Details
							</a>
						</>
					)}
				</div>
			)}
			<D3RadarChart
				technologies={technologies}
				selectedTechnology={selectedTechnology}
				onTechnologyClick={handleTechnologyClick}
				onTechnologyHover={handleTechnologyHover}
				width={700}
				height={700}
			/>
		</div>
	);
};

export default D3RadarChartDemo;
