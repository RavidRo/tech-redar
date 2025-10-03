import type { Technology } from './hooks/useTechnologies';

export const technologiesSample: Technology[] = [
	{
		name: 'Filebeat',
		category: 'Observability',
		stage: 'Adopt',
		tags: ['Logs'],
		detailsPage: null,
		history: {
			stageTransitions: [],
			discoveryDate: new Date(),
		},
	},
	{
		name: 'Logstash',
		category: 'Observability',
		stage: 'Adopt',
		tags: ['Logs'],
		detailsPage: null,
		history: {
			stageTransitions: [],
			discoveryDate: new Date(),
		},
	},
	{
		name: 'Kip',
		category: 'Observability',
		stage: 'Hold',
		tags: ['Monitoring'],
		detailsPage: null,
		history: {
			stageTransitions: [
				{
					adrLink: 'https://www.google.com/',
					transitionDate: new Date(),
					originalStage: 'Assess',
				},
			],
			discoveryDate: new Date(),
		},
	},
	{
		name: 'Pyguru',
		category: 'Development Tools',
		stage: 'Assess',
		tags: ['Monitoring'],
		detailsPage: null,
		history: {
			stageTransitions: [],
			discoveryDate: new Date(),
		},
	},
];
