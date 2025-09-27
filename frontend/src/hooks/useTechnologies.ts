import { create } from 'zustand';
// import { technologiesSample } from '../technologiesSample';

export const CATEGORIES = ['Observability', 'Development Tools', 'Data Management'] as const;
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

interface TechnologyStoreActions {
	addTechnology: (technology: Omit<Technology, 'history'>) => void;
	deleteTechnology: (technologyKey: Technology['name']) => void;
	moveStage: (technologyKey: Technology['name'], newStage: Technology['stage']) => void;
	revert: () => void;
	loadTechnologies: (technologies: Technology[]) => void;
}

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
		moveStage: (technologyName: Technology['name'], newStage: Technology['stage']) => {
			set((state) => ({
				technologies: state.technologies.map((tech) =>
					tech.name === technologyName ? { ...tech, stage: newStage } : tech,
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
