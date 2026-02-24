'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
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

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobSchema, JobFormValues } from '@/lib/validators/job';
import { useCreateJob } from '@/hooks/useCreateJob';
import { useEffect, useState } from 'react';
import { useUpdateJob } from '@/hooks/useUpdateJob';
import { cn } from '@/lib/utils';

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
		if (initialData) {
			reset({
				company: initialData.company ?? '',
				position: initialData.position ?? '',
				positionType: initialData.positionType ?? 'Full Time',
				location: initialData.location ?? '',
				link: initialData.link ?? '',
				status: initialData.status ?? 'Applied'
			});
		}
	}, [initialData, reset]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
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
