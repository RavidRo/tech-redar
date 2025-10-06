import React, { useState } from 'react';
import type { Technology } from '../../hooks/useTechnologies';
import { D3RadarChart, RadarChart } from './Radar';
import ThoughtWorksRadar from './ThoughtWorksRadar';

interface RadarViewProps {
	technologies: Technology[];
}

const RadarView: React.FC<RadarViewProps> = ({ technologies }) => {
	const [selectedTechnology, setSelectedTechnology] = useState<Technology | undefined>();
	const [hoveredTechnology, setHoveredTechnology] = useState<Technology | null>(null);
	const [radarType, setRadarType] = useState<'thoughtworks' | 'd3' | 'svg'>('thoughtworks');

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
		<div style={{ width: '100%', minHeight: '800px' }}>
			<div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
				<span style={{ fontWeight: '500' }}>Radar Implementation:</span>
				<button
					onClick={() => {
						setRadarType('thoughtworks');
					}}
					style={{
						padding: '6px 12px',
						backgroundColor: radarType === 'thoughtworks' ? '#1890ff' : '#f0f0f0',
						color: radarType === 'thoughtworks' ? 'white' : 'black',
						border: '1px solid #d9d9d9',
						borderRadius: '4px',
						cursor: 'pointer',
						fontSize: '12px',
					}}
				>
					ThoughtWorks (Original)
				</button>
				<button
					onClick={() => {
						setRadarType('d3');
					}}
					style={{
						padding: '6px 12px',
						backgroundColor: radarType === 'd3' ? '#1890ff' : '#f0f0f0',
						color: radarType === 'd3' ? 'white' : 'black',
						border: '1px solid #d9d9d9',
						borderRadius: '4px',
						cursor: 'pointer',
						fontSize: '12px',
					}}
				>
					D3.js (Animated)
				</button>
				<button
					onClick={() => {
						setRadarType('svg');
					}}
					style={{
						padding: '6px 12px',
						backgroundColor: radarType === 'svg' ? '#1890ff' : '#f0f0f0',
						color: radarType === 'svg' ? 'white' : 'black',
						border: '1px solid #d9d9d9',
						borderRadius: '4px',
						cursor: 'pointer',
						fontSize: '12px',
					}}
				>
					SVG (Static)
				</button>
			</div>

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

			<div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
				{radarType === 'thoughtworks' ? (
					<ThoughtWorksRadar
						technologies={technologies}
						selectedTechnology={selectedTechnology}
						onTechnologyClick={handleTechnologyClick}
						onTechnologyHover={handleTechnologyHover}
						width={1088}
						height={1088}
					/>
				) : radarType === 'd3' ? (
					<D3RadarChart
						technologies={technologies}
						selectedTechnology={selectedTechnology}
						onTechnologyClick={handleTechnologyClick}
						onTechnologyHover={handleTechnologyHover}
						width={700}
						height={700}
					/>
				) : (
					<RadarChart
						technologies={technologies}
						selectedTechnology={selectedTechnology}
						onTechnologyClick={handleTechnologyClick}
						onTechnologyHover={handleTechnologyHover}
						width={700}
						height={700}
					/>
				)}
			</div>
		</div>
	);
};

export default RadarView;
