'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';

import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobSchema, JobFormValues } from '@/lib/validators/job';
import { useCreateJob } from '@/hooks/useCreateJob';
import { useEffect, useState } from 'react';
import { useUpdateJob } from '@/hooks/useUpdateJob';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

type JobFormDialogProps = {
	mode?: 'create' | 'edit';
	initialData?: any;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export function JobFormDialog({
	mode = 'create',
	initialData,
	open: controlledOpen,
	onOpenChange
}: JobFormDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const [openDatePicker, setOpenDatePicker] = useState(false);
	const open = controlledOpen ?? internalOpen;
	const setOpen = onOpenChange ?? setInternalOpen;
	const { isPending } = useCreateJob();

	const createMutation = useCreateJob();
	const updateMutation = useUpdateJob();

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		watch,
		formState: { errors }
	} = useForm<JobFormValues>({
		resolver: zodResolver(jobSchema) as any,
		defaultValues: {
			company: initialData?.company ?? '',
			position: initialData?.position ?? '',
			positionType: initialData?.positionType ?? 'Full Time',
			location: initialData?.location ?? '',
			dateApplied: initialData?.dateApplied ? new Date(initialData.dateApplied) : undefined,
			link: initialData?.link ?? '',
			status: initialData?.status ?? 'Applied'
		}
	});

	const onSubmit = (data: JobFormValues) => {
		if (mode === 'edit' && initialData?.id) {
			updateMutation.mutate(
				{ id: initialData.id, data },
				{
					onSuccess: () => {
						reset();
						setOpen(false);
					}
				}
			);
		} else {
			createMutation.mutate(data, {
				onSuccess: () => {
					reset();
					setOpen(false);
				}
			});
		}
	};

	useEffect(() => {
		if (!open) {
			reset();
		}
	}, [open, reset]);

	useEffect(() => {
		if (mode === 'edit' && initialData) {
			reset(initialData);
		} else if (mode === 'create') {
			reset({
				company: '',
				position: '',
				positionType: 'Full Time',
				location: '',
				dateApplied: new Date(),
				link: '',
				status: 'Applied'
			});
		}
	}, [initialData, mode, reset]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent onOpenAutoFocus={e => e.preventDefault()}>
				<DialogHeader>
					<DialogTitle>
						{mode === 'edit'
							? 'Edit Job Application'
							: 'Create Job Application'}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<Input
							placeholder="Company"
							{...register('company')}
							className={cn(
								errors.company &&
									'border-destructive focus-visible:ring-destructive'
							)}
						/>
					</div>

					<div>
						<Input
							placeholder="Position"
							{...register('position')}
							className={cn(
								errors.position &&
									'border-destructive focus-visible:ring-destructive'
							)}
						/>
					</div>

					<div>
						<Select
							defaultValue="Full Time"
							value={watch('positionType')}
							onValueChange={value => setValue('positionType', value as any)}>
							<SelectTrigger>
								<SelectValue placeholder="Position Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Full Time">Full Time</SelectItem>
								<SelectItem value="Part Time">Part Time</SelectItem>
								<SelectItem value="Contractor">Contractor</SelectItem>
								<SelectItem value="Unknown">Unknown</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Input
							placeholder="Location"
							{...register('location')}
							className={cn(
								errors.location &&
									'border-destructive focus-visible:ring-destructive'
							)}
						/>
					</div>
					<Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal">
								<CalendarIcon />
								{watch('dateApplied') ? format(watch('dateApplied'), 'dd/LL/yyyy') : <span>Date Applied</span>}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={watch('dateApplied')}
								onSelect={(selectedDate: any) => {
									setValue('dateApplied', selectedDate);
									setOpenDatePicker(false);
								}}
							/>
						</PopoverContent>
					</Popover>
					<div>
						<Input
							placeholder="Link"
							{...register('link')}
							className={cn(
								errors.link &&
									'border-destructive focus-visible:ring-destructive'
							)}
						/>
					</div>

					{mode === 'edit' && (
						<Select
							value={watch('status')}
							onValueChange={value => setValue('status', value as any)}>
							<SelectTrigger>
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Applied">Applied</SelectItem>
								<SelectItem value="Interview">Interview</SelectItem>
								<SelectItem value="Rejected">Rejected</SelectItem>
								<SelectItem value="Offer">Offer</SelectItem>
							</SelectContent>
						</Select>
					)}

					<Button type="submit" className="w-full">
						{mode === 'edit'
							? 'Save Changes'
							: isPending
								? 'Creating...'
								: 'Create Job'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
