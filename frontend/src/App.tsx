import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import './App.css';
import EditTechnologyModalForm, {
	type EditTechnologyModalFormRef,
} from './components/EditTechnologyModalForm';
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

	const { isPending, error, isSuccess } = useQuery({
		queryKey: ['app-name'],
		queryFn: () =>
			api.getTechnologies().then((fetchedTechnologies) => {
				store.loadTechnologies(fetchedTechnologies.technologies);
				return fetchedTechnologies;
			}),
		retry: 0,
	});
	useLoadingToast('fetching-technology', isPending, 'Fetching Technology Radar');

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
	const updateTechnologyMutation = useToastedMutation({
		mutationFn: api.updateTechnology,
		onError: store.revert,
		successMessage: (_data, variables) => `Saved ${variables.name}`,
		loadingMessage: (variables) => `Updating ${variables.name}`,
	});

	const [isAddModalOpen, setIsAddModalOpen] = useState(false);

	const tags = [...new Set(store.technologies.map((technology) => technology.tags).flat())];

	const editTechnologyModalRef = useRef<EditTechnologyModalFormRef>(null);

	return (
		<>
			<h1>Tech Radar 380</h1>
			{error ? (
				<ErrorBox error={error} errorMessage="Encountered an error while fetching technologies" />
			) : isSuccess ? (
				<TechnologiesTable
					technologies={store.technologies}
					onAddNewTechnology={() => {
						setIsAddModalOpen(true);
					}}
					editTechnology={(technology) => {
						editTechnologyModalRef.current?.open(technology);
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
				isOpen={isAddModalOpen}
				closeModal={() => {
					setIsAddModalOpen(false);
				}}
				addTechnology={(technology: Omit<Technology, 'history'>) => {
					store.addTechnology(technology);
					addTechnologyMutation.mutate(technology);
				}}
			/>
			<EditTechnologyModalForm
				tags={tags}
				onSave={(editedTech) => {
					store.editTechnology(editedTech);
					updateTechnologyMutation.mutate(editedTech);
				}}
				ref={editTechnologyModalRef}
			/>
		</>
	);
}

export default App;
