import { create } from 'zustand';
// import { technologiesSample } from '../technologiesSample';

export const CATEGORIES = [
	'Observability',
	'Development Tools',
	'Frameworks',
	'Data Management',
] as const;
export const STAGES = ['Asses', 'Trial', 'Adopt', 'Hold'] as const;
export type Category = (typeof CATEGORIES)[number];
export type Stage = (typeof STAGES)[number];

export interface StageTransition {
	originalStage: Stage;
	transitionDate: Date;
	adrLink: string;
}

export interface Technology {
	name: string;
	category: Category;
	stage: Stage;
	tags: string[];
	detailsPage: string | null;
	history: { stageTransitions: StageTransition[]; discoveryDate: Date };
}

interface TechnologyStoreState {
	technologies: Technology[];
	previous_state: Technology[];
}

export type EditedTechnology = Omit<Technology, 'history' | 'stage'> & {
	stageTransition: { newStage: Stage; adrLink: string } | null;
};

interface TechnologyStoreActions {
	addTechnology: (technology: Omit<Technology, 'history'>) => void;
	deleteTechnology: (technologyKey: Technology['name']) => void;
	revert: () => void;
	loadTechnologies: (technologies: Technology[]) => void;
	editTechnology: (technology: EditedTechnology) => void;
}

const createNewTechnologyDocument = (
	original: Technology,
	editValues: EditedTechnology,
): Technology => {
	const stageTransition: StageTransition | null = editValues.stageTransition
		? {
				originalStage: original.stage,
				adrLink: editValues.stageTransition.adrLink,
				transitionDate: new Date(),
			}
		: null;
	return {
		name: editValues.name,
		category: editValues.category,
		detailsPage: editValues.detailsPage,
		tags: editValues.tags,
		stage: editValues.stageTransition ? editValues.stageTransition.newStage : original.stage,
		history: {
			discoveryDate: original.history.discoveryDate,
			stageTransitions: [
				...original.history.stageTransitions,
				...(stageTransition ? [stageTransition] : []),
			],
		},
	};
};

export const useTechnologiesStore = create<TechnologyStoreState & TechnologyStoreActions>(
	(set) => ({
		technologies: [],
		previous_state: [],
		addTechnology: (technology) => {
			set((state) => ({
				technologies: [
					...state.technologies,
					{
						...technology,
						history: { stageTransitions: [], discoveryDate: new Date() },
					},
				],
				previous_state: state.technologies,
			}));
		},
		deleteTechnology: (technologyName: Technology['name']) => {
			set((state) => ({
				technologies: state.technologies.filter((tech) => tech.name !== technologyName),
				previous_state: state.technologies,
			}));
		},
		editTechnology: (editedTechnology: EditedTechnology) => {
			set((state) => ({
				technologies: state.technologies.map((originalTech) =>
					originalTech.name === editedTechnology.name
						? createNewTechnologyDocument(originalTech, editedTechnology)
						: originalTech,
				),
				previous_state: state.technologies,
			}));
		},
		revert: () => {
			set((state) => ({ technologies: state.previous_state }));
		},
		loadTechnologies: (technologies: Technology[]) => {
			set({ technologies });
		},
	}),
);
