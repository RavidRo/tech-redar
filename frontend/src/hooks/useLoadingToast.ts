import { useEffect } from 'react';
import toast from 'react-hot-toast';

const useLoadingToast = (toastID: string, isLoading: boolean, loading?: string) => {
	useEffect(() => {
		toast.dismiss(toastID);
		if (isLoading) {
			toast.loading(loading ?? 'Loading...', { id: toastID, duration: 99999 });
		}
	}, [isLoading, loading, toastID]);
};

export default useLoadingToast;
