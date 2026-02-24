import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);

	const page = Number(searchParams.get('page') ?? 1);
	const limit = Number(searchParams.get('limit') ?? 10);
	const search = searchParams.get('search')?.trim() ?? '';

	const sortBy = searchParams.get('sortBy') ?? 'createdAt';
	const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

	if (page < 1 || limit < 1) {
		return new Response('Invalid pagination params', { status: 400 });
	}

	const allowedSortFields = [
		'company',
		'position',
		'positionType',
		'location',
		'dateApplied',
		'createdAt',
		'status'
	];

	const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

	const where = search
		? {
				OR: [
					{ company: { contains: search, mode: 'insensitive' as const } },
					{ position: { contains: search, mode: 'insensitive' as const } }
				]
			}
		: {};

	const total = await prisma.jobApplication.count({ where });

	let jobs = await prisma.jobApplication.findMany({
		where,
		skip: (page - 1) * limit,
		take: limit,
		orderBy: {
			[finalSortBy]: order
		}
	});

	if (['company', 'position', 'location'].includes(finalSortBy)) {
		jobs = jobs.sort((a: any, b: any) => {
			const aVal = a[finalSortBy]?.toLowerCase() ?? '';
			const bVal = b[finalSortBy]?.toLowerCase() ?? '';

			if (aVal < bVal) return order === 'asc' ? -1 : 1;
			if (aVal > bVal) return order === 'asc' ? 1 : -1;
			return 0;
		});
	}

	return Response.json({
		data: jobs,
		total,
		page,
		totalPages: Math.ceil(total / limit)
	});
}

export async function POST(req: Request) {
	if (process.env.DEMO_MODE === 'true') {
		return new Response('Read-only demo', { status: 403 });
	}

	const body = await req.json();

	const { company, position, positionType, location, link } = body;

	if (!company || !position) {
		return new Response('Missing required fields', { status: 400 });
	}

	const job = await prisma.jobApplication.create({
		data: {
			company,
			position,
			positionType: positionType ?? 'Unknown',
			location: location ?? 'Unknown',
			link: link ?? ''
		}
	});

	return Response.json(job);
}
