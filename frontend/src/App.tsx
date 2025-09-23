import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import './App.css';
import NewTechnologyModalForm from './components/NewTechnologyModalForm';
import TechnologiesTable from './components/TechnologiesTable';
import { useTechnologiesStore } from './hooks/useTechnologies';
import { getAppName } from './libraries/api';

function App() {
	const { technologies, addTechnology } = useTechnologiesStore();
	const {
		data: appNameData,
		isLoading,
		error,
	} = useQuery({ queryKey: ['app-name'], queryFn: getAppName });
	const [isModalOpen, setIsModalOpen] = useState(true);

	const tags = [...new Set(technologies.map((technology) => technology.tags).flat())];

	return (
		<>
			<h1>{appNameData?.name ?? (isLoading ? 'Loading…' : error ? 'Error' : 'App')}</h1>
			<TechnologiesTable
				technologies={technologies}
				onAddNewTechnology={() => {
					setIsModalOpen(true);
				}}
			/>
			<NewTechnologyModalForm
				tags={tags}
				isOpen={isModalOpen}
				closeModal={() => {
					setIsModalOpen(false);
				}}
				addTechnology={addTechnology}
			/>
		</>
	);
}

export default App;
