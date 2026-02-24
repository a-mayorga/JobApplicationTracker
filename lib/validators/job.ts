import { z } from 'zod';

export const jobSchema = z.object({
	company: z.string().min(2, 'Company is required'),
	position: z.string().min(2, 'Position is required'),
	positionType: z.enum(['Full Time', 'Part Time', 'Contractor', 'Unknown']),
	location: z.string().min(2, 'Location is required'),
	link: z.preprocess(
		val => {
			if (!val) return '';

			if (typeof val !== 'string') return val;

			const trimmed = val.trim();

			if (!trimmed) return '';

			if (/^https?:\/\//i.test(trimmed)) {
				return trimmed;
			}

			return `https://${trimmed}`;
		},
		z.string().url('Must be a valid URL').or(z.literal(''))
	),
	status: z.enum(['Applied', 'Interview', 'Rejected', 'Offer']).optional()
});

export type JobFormValues = z.infer<typeof jobSchema>;
