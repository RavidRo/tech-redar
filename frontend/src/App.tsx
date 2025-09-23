import { useQuery } from '@tanstack/react-query';
import './App.css';
import TechnologiesTable from './components/technologiesTable';
import { useTechnologiesStore } from './hooks/useTechnologies';
import { getAppName } from './libraries/api';

function App() {
	const { technologies } = useTechnologiesStore();
	const {
		data: appNameData,
		isLoading,
		error,
	} = useQuery({ queryKey: ['app-name'], queryFn: getAppName });

	return (
		<>
			<h1>{appNameData?.name ?? (isLoading ? 'Loading…' : error ? 'Error' : 'App')}</h1>
			<TechnologiesTable technologies={technologies} />
		</>
	);
}

export default App;
