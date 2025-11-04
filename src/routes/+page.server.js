import { error } from '@sveltejs/kit';
import { query } from '$lib/server/db.js';

const toNumber = (value) => {
	const num = Number(value);
	return Number.isFinite(num) ? num : 0;
};

const raceLabels = {
	M: 'Melayu',
	C: 'Cina',
	I: 'India',
	L: 'Lain-Lain',
	Q: 'Sarawak',
	S: 'Sabah',
	A: 'Asli',
	UNKNOWN: 'Unknown'
};

export const load = async () => {
	try {
		const [statsRows, raceRows] = await Promise.all([
			query(
				`SELECT COUNT(*) AS total,
					SUM(CASE WHEN voters_pru15 = 2 THEN 1 ELSE 0 END) AS voters_pru15,
					SUM(CASE WHEN voters_prn15 = 2 THEN 1 ELSE 0 END) AS voters_prn15
				FROM dpi_202412`
			),
			query(
				`SELECT UPPER(COALESCE(NULLIF(Kaum2, ''), 'UNKNOWN')) AS race,
					COUNT(*) AS total_current,
					SUM(CASE WHEN voters_pru15 = 2 THEN 1 ELSE 0 END) AS total_pru15,
					SUM(CASE WHEN voters_prn15 = 2 THEN 1 ELSE 0 END) AS total_prn15
				FROM dpi_202412
				GROUP BY race
				ORDER BY total_current DESC`
			)
		]);

		const statsRow = statsRows[0] ?? {};
		const stats = {
			total: toNumber(statsRow.total ?? 0),
			votersPru15: toNumber(statsRow.voters_pru15 ?? 0),
			votersPrn15: toNumber(statsRow.voters_prn15 ?? 0)
		};

		const raceBreakdown = raceRows
			.map((row) => {
				const code = (row.race ?? 'UNKNOWN').trim();
				const normalized = code ? code.toUpperCase() : 'UNKNOWN';
				return {
					code: normalized,
					label: raceLabels[normalized] ?? raceLabels.UNKNOWN,
					total: toNumber(row.total_current ?? 0),
					pru15: toNumber(row.total_pru15 ?? 0),
					prn15: toNumber(row.total_prn15 ?? 0)
				};
			})
			.filter((entry) => entry.total > 0 || entry.pru15 > 0 || entry.prn15 > 0);

		return {
			stats,
			raceBreakdown
		};
	} catch (err) {
		console.error('Failed to load data from dpi_202412', err);
		throw error(500, 'Unable to load dashboard data');
	}
};
