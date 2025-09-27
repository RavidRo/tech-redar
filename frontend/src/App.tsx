import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import './App.css';
import ErrorBox from './components/ErrorBox';
import NewTechnologyModalForm from './components/NewTechnologyModalForm';
import TechnologiesTable from './components/TechnologiesTable/TechnologiesTable';
import useLoadingToast from './hooks/useLoadingToast';
import { useTechnologiesStore, type Technology } from './hooks/useTechnologies';
import useToastedMutation from './hooks/useToastedMutation';
import * as api from './libraries/api/technologies';
import { confirmDeletion } from './libraries/confirmation';

function App() {
	const store = useTechnologiesStore();

	const { isLoading, error, isSuccess } = useQuery({
		queryKey: ['app-name'],
		queryFn: () =>
			api.getTechnologies().then((fetchedTechnologies) => {
				store.loadTechnologies(fetchedTechnologies);
				return fetchedTechnologies;
			}),
	});
	useLoadingToast(isLoading, 'Fetching Technology Radar');

	const addTechnologyMutation = useToastedMutation({
		mutationFn: api.addTechnology,
		onError: store.revert,
		successMessage: (_data, variables) => `Added ${variables.name}`,
		loadingMessage: (variables) => `Adding ${variables.name}`,
	});
	const deleteTechnologyMutation = useToastedMutation({
		mutationFn: api.deleteTechnology,
		onError: store.revert,
		successMessage: (_data, variables) => `Deleted ${variables}`,
		loadingMessage: (variables) => `Deleting ${variables}`,
	});

	const [isModalOpen, setIsModalOpen] = useState(false);

	const tags = [...new Set(store.technologies.map((technology) => technology.tags).flat())];

	return (
		<>
			<h1>Tech Radar 380</h1>
			{error ? (
				<ErrorBox error={error} errorMessage="Encountered an error while fetching technologies" />
			) : isSuccess ? (
				<TechnologiesTable
					technologies={store.technologies}
					onAddNewTechnology={() => {
						setIsModalOpen(true);
					}}
					onDeleteTechnology={(name: string) => {
						confirmDeletion(() => {
							store.deleteTechnology(name);
							deleteTechnologyMutation.mutate(name);
						}, name);
					}}
				/>
			) : (
				<></>
			)}

			<NewTechnologyModalForm
				takenNames={store.technologies.map((tech) => tech.name)}
				tags={tags}
				isOpen={isModalOpen}
				closeModal={() => {
					setIsModalOpen(false);
				}}
				addTechnology={(technology: Omit<Technology, 'history'>, adrLink: string | null) => {
					store.addTechnology(technology, adrLink);
					addTechnologyMutation.mutate({ ...technology, adrLink });
				}}
			/>
		</>
	);
}

export default App;
