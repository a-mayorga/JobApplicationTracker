import { JobTable } from '@/components/job-table';
import { Suspense } from 'react';

export default function Home() {
	const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

	return (
		<Suspense fallback={<div>Loading...</div>}>
			{isDemo && (
				<div className="text-md text-muted-foreground dark:bg-red-800 dark:text-red-50 p-2 text-center">
					This is a read-only demo.
				</div>
			)}
			<main className="p-8 space-y-6">
				<JobTable />
			</main>
		</Suspense>
	);
}
