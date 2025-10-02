import { Button, Space, Table, type TableProps } from 'antd';
import React from 'react';
import { CATEGORIES, STAGES, type Technology } from '../../hooks/useTechnologies';
import HistoryTable from '../HistoryTable';
import TechnologyTag from '../TechnologyTag';
import './TechnologiesTable.css';

const TechnologiesTable: React.FC<{
	technologies: Technology[];
	onAddNewTechnology: () => void;
	onDeleteTechnology: (name: string) => void;
	editTechnology: (technology: Technology) => void;
}> = ({ technologies, onAddNewTechnology, onDeleteTechnology, editTechnology }) => {
	const tags = [...new Set(technologies.map((technology) => technology.tags).flat())];
	const columns: TableProps<Technology>['columns'] = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			render: (name, record) =>
				record.detailsPage ? <a href={record.detailsPage}>{name}</a> : <>{name}</>,
			sorter: (tech1, tech2) => tech1.name.localeCompare(tech2.name),
		},
		{
			title: 'Category',
			dataIndex: 'category',
			key: 'category',
			filters: CATEGORIES.map((category) => ({ text: category, value: category })),
			onFilter: (value, record) => record.category == value,
		},
		{
			title: 'Stage',
			dataIndex: 'stage',
			key: 'stage',
			filters: STAGES.map((category) => ({ text: category, value: category })),
			onFilter: (value, record) => record.stage == value,
		},
		{
			title: 'Tags',
			key: 'tags',
			dataIndex: 'tags',
			filters: tags.map((tag) => ({ text: tag, value: tag })),
			onFilter: (value, record) => {
				if (typeof value !== 'string') {
					throw Error("Filter value in the 'tags' column is expected to be a string");
				}

				return record.tags.includes(value);
			},
			render: (_, { tags }) => (
				<>
					{tags.map((tag) => (
						<TechnologyTag key={tag} tag={tag} />
					))}
				</>
			),
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_, record) => (
				<Space size="middle">
					<a
						onClick={() => {
							editTechnology(record);
						}}
					>
						Edit
					</a>
					<a
						onClick={() => {
							onDeleteTechnology(record.name);
						}}
					>
						Delete
					</a>
				</Space>
			),
		},
	];
	return (
		<div className="tech-radar-table">
			<Table<Technology>
				columns={columns}
				dataSource={technologies}
				size="middle"
				expandable={{ expandedRowRender: HistoryTable }}
				footer={() => (
					<Button type="dashed" onClick={onAddNewTechnology} style={{ width: '100%' }}>
						+ Add New Technology
					</Button>
				)}
				rowKey={'name'}
			/>
		</div>
	);
};

export default TechnologiesTable;
