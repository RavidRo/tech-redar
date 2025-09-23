import { ArrowRightOutlined } from '@ant-design/icons';
import { Table, type TableProps } from 'antd';
import type { ExpandableConfig } from 'antd/es/table/interface';
import type { Stage, StageTransition, Technology } from '../hooks/useTechnologies';
import type { PartialBy, ReplaceProperty } from '../libraries/typesUtilities';

type StageView = Stage | 'Off Radar';
type StageTransitionView = PartialBy<
	ReplaceProperty<StageTransition, 'originalStage', StageView>,
	'adrLink'
>;

const HistoryTable: ExpandableConfig<Technology>['expandedRowRender'] = (tech) => {
	const transitions: StageTransitionView[] = [
		{
			adrLink: tech.history.discovery.adrLink,
			originalStage: 'Off Radar',
			transitionDate: tech.history.discovery.discoveryDate,
		},
		...tech.history.stageTransitions,
	];
	const columns: TableProps<StageTransitionView>['columns'] = [
		{
			title: 'Transitions',
			dataIndex: 'originalStage',
			key: 'transitions',
			render: (originalStage: StageView, entry, index) => {
				const nextStage =
					index === transitions.length - 1 ? tech.stage : transitions[index + 1]?.originalStage;
				const TransitionContent = () => (
					<>
						{originalStage} <ArrowRightOutlined /> {nextStage}
					</>
				);
				if (entry.adrLink !== undefined) {
					return (
						<a href={entry.adrLink}>
							<TransitionContent />
						</a>
					);
				} else {
					return <TransitionContent />;
				}
			},
		},
		{
			title: 'Transition Date',
			dataIndex: 'transitionDate',
			key: 'transitionDate',
			render: (date: Date) => {
				return (
					<>
						{date.toLocaleDateString('en-GB', {
							day: '2-digit',
							month: 'long',
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
						})}
					</>
				);
			},
		},
	];

	return (
		<Table<StageTransitionView>
			columns={columns}
			dataSource={transitions}
			size="small"
			rowKey={'transitionDate'}
			pagination={false}
		/>
	);
};

export default HistoryTable;
