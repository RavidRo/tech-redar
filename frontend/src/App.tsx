import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { z } from 'zod';
import './App.css';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

function App() {
	const [count, setCount] = useState(0);

	const appNameSchema = z.object({ name: z.string() });
	const {
		data: appNameData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['app-name'],
		queryFn: async () => {
			const res = await fetch('http://localhost:8000/app-name');
			return appNameSchema.parse(await res.json());
		},
	});

	return (
		<>
			<div>
				<a href="https://vite.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>{appNameData?.name ?? (isLoading ? 'Loading…' : error ? 'Error' : 'App')}</h1>
			<div className="card">
				<button
					onClick={() => {
						setCount((count) => count + 1);
					}}
				>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
		</>
	);
}

export default App;
