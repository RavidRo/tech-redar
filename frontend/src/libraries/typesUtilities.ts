export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ReplaceProperty<T, K extends keyof T, NewType> = Omit<T, K> & Record<K, NewType>;
