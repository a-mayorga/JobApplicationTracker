import { JobTable } from '@/components/job-table';
import { Suspense } from 'react';

export default function Home() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<main className="p-8 space-y-6">
				<JobTable />
			</main>
		</Suspense>
	);
}
