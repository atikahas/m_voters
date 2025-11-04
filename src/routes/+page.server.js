import { error } from '@sveltejs/kit';
import { query } from '$lib/server/db.js';

const toNumber = (value) => {
	const num = Number(value);
	return Number.isFinite(num) ? num : 0;
};

export const load = async () => {
	try {
		const [statsRows] = await Promise.all([
			query(
				`SELECT COUNT(*) AS total,
					SUM(CASE WHEN voters_pru15 = 2 THEN 1 ELSE 0 END) AS voters_pru15,
					SUM(CASE WHEN voters_prn15 = 2 THEN 1 ELSE 0 END) AS voters_prn15
				FROM dpi_202412`
			),
		]);

		const statsRow = statsRows[0] ?? {};
		const stats = {
			total: toNumber(statsRow.total ?? 0),
			votersPru15: toNumber(statsRow.voters_pru15 ?? 0),
			votersPrn15: toNumber(statsRow.voters_prn15 ?? 0)
		};

		return {
			stats
		};
	} catch (err) {
		console.error('Failed to load data from dpi_202412', err);
		throw error(500, 'Unable to load dashboard data');
	}
};
