import type React from 'react';
import { Toaster } from 'react-hot-toast';

const CustomToaster: React.FC = () => (
	<Toaster
		position="top-center"
		reverseOrder={false}
		gutter={8}
		containerClassName=""
		containerStyle={{}}
		toasterId="default"
		toastOptions={{
			// Define default options
			className: '',
			duration: 5000,
			removeDelay: 1000,
			style: {
				background: '#363636',
				color: '#fff',
			},

			success: {
				duration: 3000,
				iconTheme: {
					primary: 'green',
					secondary: 'black',
				},
			},
		}}
	/>
);

export default CustomToaster;
