import { useEffect } from 'react';
import toast from 'react-hot-toast';

const toastID = 'loading-technologies';
const useLoadingToast = (isLoading: boolean, loading?: string) => {
	useEffect(() => {
		toast.dismiss();
		if (isLoading) {
			toast.loading(loading ?? 'Loading...', { id: toastID });
		}
	}, [isLoading, loading]);
};

export default useLoadingToast;
