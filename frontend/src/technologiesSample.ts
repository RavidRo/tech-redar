import type { Technology } from './hooks/useTechnologies';

export const technologiesSample: Technology[] = [
	{
		key: '1',
		name: 'Filebeat',
		category: 'Observability',
		stage: 'Adopt',
		tags: ['Logs'],
		history: {
			stageTransitions: [],
			discovery: {
				discoveryDate: new Date(),
			},
		},
	},
	{
		key: '2',
		name: 'Logstash',
		category: 'Observability',
		stage: 'Adopt',
		tags: ['Logs'],
		history: {
			stageTransitions: [],
			discovery: {
				discoveryDate: new Date(),
			},
		},
	},
	{
		key: '3',
		name: 'Kip',
		category: 'Observability',
		stage: 'Hold',
		tags: ['Monitoring'],
		history: {
			stageTransitions: [
				{
					adrLink: 'https://www.google.com/',
					transitionDate: new Date(),
					originalStage: 'Asses',
				},
			],
			discovery: {
				discoveryDate: new Date(),
			},
		},
	},
	{
		key: '4',
		name: 'Pyguru',
		category: 'Development Tools',
		stage: 'Asses',
		tags: ['Monitoring'],
		history: {
			stageTransitions: [],
			discovery: {
				discoveryDate: new Date(),
			},
		},
	},
];
