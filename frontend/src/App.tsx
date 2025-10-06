import { Tabs, type TabsProps } from 'antd';
import './App.css';
import RadarView from './components/Views/RadarView';
import TechnologyTableView from './components/Views/TechnologyTableView';

const RADAR_TAB_KEY = 'radar';

function App() {
	const tabs: TabsProps['items'] = [
		{
			label: 'Radar',
			key: RADAR_TAB_KEY,
			children: <RadarView />,
		},
		{
			label: 'Table',
			key: 'table',
			children: <TechnologyTableView />,
		},
	];
	return (
		<>
			<h1>Tech Radar 380</h1>
			<Tabs type="card" size="large" defaultActiveKey={RADAR_TAB_KEY} items={tabs} />
		</>
	);
}

export default App;
