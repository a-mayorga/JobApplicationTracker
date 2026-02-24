'use client';

import { useEffect, useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { useDebounce } from '@/hooks/useDebounce';

import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
	ArrowUp,
	ArrowDown,
	Link2,
	SearchX,
	X,
	Settings2,
	ChevronRight,
	ChevronLeft
} from 'lucide-react';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { JobFormDialog } from './job-form-dialog';
import { formatDate } from '@/lib/formatDate';
import { useMounted } from '@/hooks/useMounted';

type ColumnKey =
	| 'company'
	| 'position'
	| 'positionType'
	| 'location'
	| 'dateApplied'
	| 'link'
	| 'status';

const columns: {
	key: ColumnKey;
	label: string;
	allowSorting?: boolean;
	width: string;
}[] = [
	{ key: 'company', label: 'Company', allowSorting: true, width: '180px' },
	{ key: 'position', label: 'Position', allowSorting: true, width: '280px' },
	{ key: 'positionType', label: 'Type', allowSorting: true, width: '120px' },
	{ key: 'location', label: 'Location', allowSorting: true, width: '150px' },
	{
		key: 'dateApplied',
		label: 'Date Applied',
		allowSorting: true,
		width: '140px'
	},
	{ key: 'link', label: 'Link', width: '100px' },
	{ key: 'status', label: 'Status', allowSorting: true, width: '160px' }
];

export function JobTable() {
	const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(() => {
		if (typeof window === 'undefined') {
			return columns.map(c => c.key);
		}

		const saved = localStorage.getItem('job-table-columns');
		return saved ? (JSON.parse(saved) as ColumnKey[]) : columns.map(c => c.key);
	});

	const page = Number(searchParams.get('page') ?? 1);
	const limit = Number(searchParams.get('limit') ?? 10);
	const search = searchParams.get('search') ?? '';
	const sortBy = searchParams.get('sortBy') ?? 'dateApplied';
	const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
	const [searchInput, setSearchInput] = useState(search);
	const [editingJob, setEditingJob] = useState<any>(null);
	const [jobDialogOpen, setJobDialogOpen] = useState(false);
	const mounted = useMounted();
	const visibleCount = visibleColumns.length;

	const debouncedSearch = useDebounce(searchInput, 400);
	const { data, isLoading, isFetching } = useJobs(
		page,
		limit,
		debouncedSearch,
		sortBy,
		order
	);

	const queryClient = useQueryClient();

	useEffect(() => {
		localStorage.setItem('job-table-columns', JSON.stringify(visibleColumns));
	}, [visibleColumns]);

	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	useEffect(() => {
		updateParams({
			search: debouncedSearch,
			page: '1'
		});
	}, [debouncedSearch]);

	useEffect(() => {
		if (!data) return;

		if (page >= data.totalPages) return;

		const nextPage = page + 1;

		queryClient.prefetchQuery({
			queryKey: ['jobs', nextPage, limit, search, sortBy, order],
			queryFn: async () => {
				const res = await fetch(
					`/api/jobs?page=${nextPage}&limit=${limit}&search=${search}&sortBy=${sortBy}&order=${order}`
				);

				if (!res.ok) throw new Error('Prefetch failed');

				return res.json();
			},
			staleTime: 1000 * 60 * 5
		});
	}, [data, page, limit, search, sortBy, order, queryClient]);

	useEffect(() => {
		const params = new URLSearchParams();

		params.set('page', String(page));
		params.set('limit', String(limit));

		if (search) params.set('search', search);

		params.set('sortBy', sortBy);
		params.set('order', order);

		router.replace(`${pathname}?${params.toString()}`);
	}, [page, limit, search, sortBy, order]);

	function handleSort(column: string) {
		if (sortBy !== column) {
			updateParams({
				sortBy: column,
				order: 'asc',
				page: '1'
			});
			return;
		}

		if (order === 'asc') {
			updateParams({
				sortBy: column,
				order: 'desc',
				page: '1'
			});
			return;
		}

		updateParams({
			sortBy: 'dateApplied',
			order: 'desc',
			page: '1'
		});
	}

	function getVisiblePages(current: number, total: number, maxVisible = 3) {
		const half = Math.floor(maxVisible / 2);

		let start = Math.max(current - half, 1);
		let end = Math.min(start + maxVisible - 1, total);

		if (end - start < maxVisible - 1) {
			start = Math.max(end - maxVisible + 1, 1);
		}

		const pages = [];
		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		return pages;
	}

	function updateParams(updates: Record<string, string>) {
		const params = new URLSearchParams(searchParams.toString());

		Object.entries(updates).forEach(([key, value]) => {
			if (!value) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		});

		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	}

	function SortIcon({ column }: { column: string }) {
		if (sortBy !== column) {
			return null;
		}

		if (order === 'asc') {
			return <ArrowUp className="ml-2 h-4 w-4 inline" />;
		}

		return <ArrowDown className="ml-2 h-4 w-4 inline" />;
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'Applied':
				return 'dark:bg-blue-950 dark:text-blue-300';
			case 'Interview':
				return 'dark:bg-violet-950 dark:text-violet-300';
			case 'Offer':
				return 'dark:bg-emerald-950 dark:text-emerald-300';
			case 'Rejected':
				return 'dark:bg-red-950 dark:text-red-300';
			default:
				return 'dark:bg-gray-900 dark:text-gray-300';
		}
	}

	function getPositionTypeColor(positionType: string) {
		switch (positionType) {
			case 'Full Time':
				return 'dark:bg-sky-950 dark:text-sky-300';
			case 'Part Time':
				return 'dark:bg-violet-950 dark:text-violet-300';
			case 'Contractor':
				return 'dark:bg-emerald-950 dark:text-emerald-300';
			case 'Unknown':
			default:
				return 'dark:bg-gray-900 dark:text-gray-300';
		}
	}

	function toggleColumn(column: ColumnKey) {
		setVisibleColumns(prev =>
			prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
		);
	}

	if (!mounted) return null;

	return (
		<>
			<div className="space-y-6">
				<div className="flex flex-col md:flex-row gap-4 justify-between">
					<div className="flex flex-col md:flex-row md:items-center gap-4">
						<div className="relative max-w-sm">
							<Input
								placeholder="Search company or position..."
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								className="max-w-sm pr-8"
							/>
							{searchInput && (
								<button
									type="button"
									onClick={() => {
										setSearchInput('');
										updateParams({ search: '', page: '1' });
									}}
									className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
						<div className="text-sm text-muted-foreground">
							{data?.total ?? 0} applications found
						</div>
					</div>
					<div className="flex items-center gap-4">
						{!isDemo && (
							<Button onClick={() => setJobDialogOpen(true)}>Add Job</Button>
						)}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline">
									<Settings2 className="h-4 w-4 mr-2" />
									Columns
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent align="end">
								{columns.map(col => (
									<DropdownMenuCheckboxItem
										key={col.key}
										checked={visibleColumns.includes(col.key)}
										onCheckedChange={() => toggleColumn(col.key)}>
										{col.label}
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				<div className="rounded-md border w-full overflow-x-auto">
					<Table className="table-fixed min-w-[1000px]">
						{/* Table Columns */}
						<TableHeader>
							<TableRow>
								{columns
									?.filter(col => visibleColumns.includes(col.key))
									.map(col => (
										<TableHead
											key={col.key}
											className={`font-bold select-none ${col.allowSorting ? 'cursor-pointer' : ''}`}
											onClick={() => col.allowSorting && handleSort(col.key)}>
											<div className="flex items-center">
												{col.label}
												{col.allowSorting && <SortIcon column={col.key} />}
											</div>
										</TableHead>
									))}
							</TableRow>
						</TableHeader>

						<TableBody>
							{/* Skeleton */}
							{isLoading &&
								Array.from({ length: limit }).map((_, i) => (
									<TableRow key={i}>
										<TableCell>
											<Skeleton className="h-4 w-[120px]" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-[180px]" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-[90px]" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-[100px]" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-8 w-[120px]" />
										</TableCell>
									</TableRow>
								))}
							{/* Empty State */}
							{!isLoading && !isFetching && data?.data?.length === 0 && (
								<TableRow>
									<TableCell colSpan={visibleCount} className="py-12">
										<div className="flex flex-col items-center justify-center text-center space-y-3">
											<SearchX className="h-8 w-8 text-muted-foreground" />

											{debouncedSearch ? (
												<>
													<p className="text-sm font-medium">
														No results found for "{search}"
													</p>
													<p className="text-sm text-muted-foreground">
														Try adjusting your search or clear the filter.
													</p>

													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															updateParams({ search: '', page: '1' })
														}>
														Clear search
													</Button>
												</>
											) : (
												<>
													<p className="text-sm font-medium">
														No job applications yet
													</p>
													<p className="text-sm text-muted-foreground">
														Start by adding your first job application.
													</p>
												</>
											)}
										</div>
									</TableCell>
								</TableRow>
							)}
							{/* Table Rows */}
							{!isLoading &&
								data?.data?.map((job: any) => (
									<TableRow
										key={job.id}
										className="hover:bg-muted/50 transition-colors cursor-pointer select-none overflow-hidden text-ellipsis whitespace-nowrap"
										onDoubleClick={() => {
											if (isDemo) return;
											setEditingJob(job);
											setJobDialogOpen(true);
										}}>
										{visibleColumns.includes('company') && (
											<TableCell className="truncate max-w-[180px]">
												{job.company}
											</TableCell>
										)}
										{visibleColumns.includes('position') && (
											<TableCell className="truncate max-w-[280px]">
												{job.position}
											</TableCell>
										)}
										{visibleColumns.includes('positionType') && (
											<TableCell className="truncate max-w-[120px]">
												<Badge
													className={getPositionTypeColor(job.positionType)}>
													{job.positionType}
												</Badge>
											</TableCell>
										)}
										{visibleColumns.includes('location') && (
											<TableCell className="truncate max-w-[150px]">
												{job.location}
											</TableCell>
										)}

										{visibleColumns.includes('dateApplied') && (
											<TableCell className="truncate max-w-[140px]">
												{formatDate(job.dateApplied)}
											</TableCell>
										)}
										{visibleColumns.includes('link') && (
											<TableCell className="truncate max-w-[100px]">
												{job.link ? (
													<a
														href={job.link}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-600 hover:underline">
														<Link2 />
													</a>
												) : (
													'-'
												)}
											</TableCell>
										)}
										{visibleColumns.includes('status') && (
											<TableCell className="truncate max-w-[160px]">
												<div className="flex items-center gap-2">
													<Badge className={getStatusColor(job.status)}>
														{job.status}
													</Badge>
												</div>
											</TableCell>
										)}
									</TableRow>
								))}
						</TableBody>
					</Table>
				</div>

				<div className="flex justify-center w-full">
					{/* Pagination */}
					<div className="flex items-center justify-center gap-2">
						{page > 1 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => updateParams({ page: String(page - 1) })}>
								<ChevronLeft />
							</Button>
						)}

						{data &&
							getVisiblePages(page, data.totalPages).map(pageNumber => (
								<Button
									key={pageNumber}
									size="sm"
									variant={page === pageNumber ? 'default' : 'outline'}
									onClick={() => updateParams({ page: String(pageNumber) })}>
									{pageNumber}
								</Button>
							))}

						{page < data?.totalPages && (
							<Button
								variant="ghost"
								size="sm"
								disabled={page === data?.totalPages}
								onClick={() => updateParams({ page: String(page + 1) })}>
								<ChevronRight />
							</Button>
						)}
					</div>
					<div className="flex items-center gap-2 ml-auto">
						Show
						<Select
							value={String(limit)}
							onValueChange={value =>
								updateParams({
									limit: value,
									page: '1'
								})
							}>
							<SelectTrigger>
								<SelectValue placeholder="Rows" />
							</SelectTrigger>
							<SelectContent position="item-aligned">
								<SelectItem value="5">5</SelectItem>
								<SelectItem value="10">10</SelectItem>
								<SelectItem value="20">20</SelectItem>
								<SelectItem value="50">50</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
			<JobFormDialog
				mode={editingJob ? 'edit' : 'create'}
				initialData={editingJob}
				open={jobDialogOpen}
				onOpenChange={open => {
					if (!open) {
						setEditingJob(null);
						setJobDialogOpen(false);
					}
				}}
			/>
		</>
	);
}
