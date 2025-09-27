import Swal from 'sweetalert2';

export const confirmDeletion = (onConfirm: () => void, deletedItem: string) => {
	Swal.fire({
		title: `Are you sure you want to delete ${deletedItem}?`,
		text: "You won't be able to revert this!",
		icon: 'warning',
		showDenyButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes, delete it!',
	})
		.then((result) => {
			if (result.isConfirmed) {
				onConfirm();
			}
		})
		.catch(() => {
			throw Error('Failed to open confirmation modal');
		});
};
