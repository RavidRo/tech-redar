import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import './App.css';
import ErrorBox from './components/ErrorBox';
import NewTechnologyModalForm from './components/NewTechnologyModalForm';
import TechnologiesTable from './components/TechnologiesTable/TechnologiesTable';
import useLoadingToast from './hooks/useLoadingToast';
import { useTechnologiesStore, type Technology } from './hooks/useTechnologies';
import * as api from './libraries/api';

function App() {
	const { technologies, addTechnology, revert, loadTechnologies } = useTechnologiesStore();

	const { isLoading, error, isSuccess } = useQuery({
		queryKey: ['app-name'],
		retry: false,
		queryFn: () =>
			api.getTechnologies().then((fetchedTechnologies) => {
				loadTechnologies(fetchedTechnologies);
				return fetchedTechnologies;
			}),
	});

	useLoadingToast(isLoading, 'Fetching Technology Radar');

	const [isModalOpen, setIsModalOpen] = useState(false);

	const tags = [...new Set(technologies.map((technology) => technology.tags).flat())];

	return (
		<>
			<h1>Tech Radar 380</h1>
			{error ? (
				<ErrorBox error={error} errorMessage="Encountered an error while fetching technologies" />
			) : isSuccess ? (
				<TechnologiesTable
					technologies={technologies}
					onAddNewTechnology={() => {
						setIsModalOpen(true);
					}}
				/>
			) : (
				<></>
			)}

			<NewTechnologyModalForm
				takenNames={technologies.map((tech) => tech.name)}
				tags={tags}
				isOpen={isModalOpen}
				closeModal={() => {
					setIsModalOpen(false);
				}}
				addTechnology={(technology: Omit<Technology, 'history'>, adrLink: string | null) => {
					addTechnology(technology, adrLink);
					api.addTechnology({ ...technology, adrLink }).catch((reason: unknown) => {
						revert();
						toast.error(String(reason));
					});
				}}
			/>
		</>
	);
}

export default App;
