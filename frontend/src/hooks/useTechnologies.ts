import { create } from 'zustand';
import { technologiesSample } from '../technologiesSample';

export const CATEGORIES = ['Observability', 'Development Tools', 'Data Management'] as const;
export const STAGES = ['Asses', 'Trial', 'Adopt', 'Hold'] as const;
export type Category = (typeof CATEGORIES)[number];
export type Stage = (typeof STAGES)[number];

export interface StageTransition {
	originalStage: Stage;
	transitionDate: Date;
	adrLink: string;
}

export interface InitialDiscovery {
	discoveryDate: Date;
	// It's optional because the first discovery may have been not recorded
	adrLink?: string;
}

export interface Technology {
	key: string;
	name: string;
	category: Category;
	stage: Stage;
	tags: string[];
	history: { stageTransitions: StageTransition[]; discovery: InitialDiscovery };
}

interface TechnologyStoreState {
	technologies: Technology[];
}

interface TechnologyStoreActions {
	addTechnology: (technology: Omit<Technology, 'history'>, adrLink?: string) => void;
	deleteTechnology: (technologyKey: Technology['key']) => void;
	moveStage: (technologyKey: Technology['key'], newStage: Technology['stage']) => void;
}

export const useTechnologiesStore = create<TechnologyStoreState & TechnologyStoreActions>(
	(set) => ({
		technologies: technologiesSample,
		addTechnology: (technology, adrLink?: string) => {
			set((state) => ({
				technologies: [
					...state.technologies,
					{
						...technology,
						history: { stageTransitions: [], discovery: { adrLink, discoveryDate: new Date() } },
					},
				],
			}));
		},
		deleteTechnology: (technologyKey: Technology['key']) => {
			set((state) => ({
				technologies: state.technologies.filter((tech) => tech.key !== technologyKey),
			}));
		},
		moveStage: (technologyKey: Technology['key'], newStage: Technology['stage']) => {
			set((state) => ({
				technologies: state.technologies.map((tech) =>
					tech.key === technologyKey ? { ...tech, stage: newStage } : tech,
				),
			}));
		},
	}),
);
