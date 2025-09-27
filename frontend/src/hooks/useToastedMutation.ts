import {
	QueryClient,
	useMutation,
	type DefaultError,
	type MutationFunctionContext,
	type UseMutationOptions,
	type UseMutationResult,
} from '@tanstack/react-query';
import toast from 'react-hot-toast'; // TODO: Replace 'react-hot-toast' with sweetalert2 (https://sweetalert2.github.io/#configuration)
import useLoadingToast from './useLoadingToast';

interface ToastedMutationOptions<TData = unknown, TVariables = void, TOnMutateResult = unknown> {
	successMessage?:
		| string
		| ((
				data: TData,
				variables: TVariables,
				onMutateResult: TOnMutateResult | undefined,
				context: MutationFunctionContext,
		  ) => string);
	loadingMessage?: string | ((variables: TVariables) => string);
}

const useToastedMutation = <
	TData = unknown,
	TError = DefaultError,
	TVariables = void,
	TOnMutateResult = unknown,
>(
	options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult> &
		ToastedMutationOptions<TData, TVariables, TOnMutateResult>,
	queryClient?: QueryClient,
): UseMutationResult<TData, TError, TVariables, TOnMutateResult> => {
	const onSuccess = (
		data: TData,
		variables: TVariables,
		onMutateResult: TOnMutateResult | undefined,
		context: MutationFunctionContext,
	) => {
		if (options.successMessage === undefined) {
			toast.success('success');
		} else if (typeof options.successMessage === 'string') {
			toast.success(options.successMessage);
		} else {
			toast.success(options.successMessage(data, variables, onMutateResult, context));
		}

		if (options.onSuccess !== undefined) {
			options.onSuccess(data, variables, onMutateResult, context);
		}
	};
	const onError = (
		error: TError,
		variables: TVariables,
		onMutateResult: TOnMutateResult | undefined,
		context: MutationFunctionContext,
	) => {
		toast.error(String(error));
		if (options.onError !== undefined) {
			options.onError(error, variables, onMutateResult, context);
		}
	};

	const mutation = useMutation({ ...options, onError, onSuccess }, queryClient);

	const loadingMessage =
		options.loadingMessage === undefined || mutation.variables === undefined
			? 'loading'
			: typeof options.loadingMessage === 'string'
				? options.loadingMessage
				: options.loadingMessage(mutation.variables);
	useLoadingToast(mutation.isPending, loadingMessage);

	return mutation;
};

export default useToastedMutation;
