import type { Technology } from './hooks/useTechnologies';

export const technologiesSample: Technology[] = [
	{
		name: 'Filebeat',
		category: 'Observability',
		stage: 'Adopt',
		tags: ['Logs'],
		history: {
			stageTransitions: [],
			discovery: {
				discoveryDate: new Date(),
				adrLink: null,
			},
		},
	},
	{
		name: 'Logstash',
		category: 'Observability',
		stage: 'Adopt',
		tags: ['Logs'],
		history: {
			stageTransitions: [],
			discovery: {
				discoveryDate: new Date(),
				adrLink: null,
			},
		},
	},
	{
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
				adrLink: null,
			},
		},
	},
	{
		name: 'Pyguru',
		category: 'Development Tools',
		stage: 'Asses',
		tags: ['Monitoring'],
		history: {
			stageTransitions: [],
			discovery: {
				discoveryDate: new Date(),
				adrLink: null,
			},
		},
	},
];
