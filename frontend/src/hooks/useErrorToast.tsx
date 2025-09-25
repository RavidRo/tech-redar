import { useEffect } from 'react';
import toast from 'react-hot-toast';

const toastID = 'error-toast';
const useErrorToast = (error: Error | null) => {
	useEffect(() => {
		if (error) {
			toast.dismiss(toastID);
			toast.error(
				<div>
					<h3>There was an oopsi</h3>
					<pre
						style={{
							whiteSpace: 'pre-wrap',
							wordBreak: 'break-word',
							margin: 0,
							maxHeight: '300px',
							fontFamily: 'monospace',
						}}
					>
						{String(error)}
					</pre>
				</div>,
				{
					id: toastID,
					duration: 8000,
					style: {
						overflow: 'auto',
						background: '#2d2d2d',
						color: '#f5f5f5',
						fontSize: '0.85rem',
						borderRadius: '10px',
						padding: '12px',
						textAlign: 'left',
						maxWidth: '1000px',
					},
				},
			);
		}
	}, [error]);
};

export default useErrorToast;
