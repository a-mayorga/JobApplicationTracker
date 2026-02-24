'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateJob() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: any) => {
			const res = await fetch('/api/jobs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (!res.ok) {
				throw new Error('Failed to create job');
			}

			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['jobs'],
				exact: false
			});
		}
	});
}
