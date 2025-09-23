import { Space, Table, Tag, type TableProps } from 'antd';
import React from 'react';
import { CATEGORIES, STAGES, type Technology } from '../hooks/useTechnologies';
import { generateColorFromString } from '../libraries/colors';
import HistoryTable from './historyTable';

const TechnologiesTable: React.FC<{ technologies: Technology[] }> = ({ technologies }) => {
	const tags = [...new Set(technologies.map((technology) => technology.tags).flat())];
	const columns: TableProps<Technology>['columns'] = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			render: (name) => <a>{name}</a>,
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
					{tags.map((tag) => {
						const color = generateColorFromString(tag);
						return (
							<Tag color={color} key={tag}>
								{tag.toUpperCase()}
							</Tag>
						);
					})}
				</>
			),
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_, _record) => (
				<Space size="middle">
					<a>Change Stage</a>
					<a>Delete</a>
				</Space>
			),
		},
	];
	return (
		<Table<Technology>
			columns={columns}
			dataSource={technologies}
			size="middle"
			expandable={{ expandedRowRender: HistoryTable }}
		/>
	);
};

export default TechnologiesTable;
