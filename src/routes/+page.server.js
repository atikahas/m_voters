import { error } from '@sveltejs/kit';
import { query } from '$lib/server/db.js';

const toNumber = (value) => {
	const num = Number(value);
	return Number.isFinite(num) ? num : 0;
};

export const load = async () => {
	try {
		const [peopleRows, topStateRows, statsRows, genderRows, ageRows] = await Promise.all([
			query(
				`SELECT pplid AS id,
				        Nama AS name,
				        age,
				        Negeri AS state,
				        KodParlimen AS parliament,
				        KodDUN AS dun
				 FROM dpi_202412
				 ORDER BY pplid DESC
				 LIMIT 25`
			),
			query(
				`SELECT Negeri AS state,
				        COUNT(*) AS total
				 FROM dpi_202412
				 WHERE Negeri IS NOT NULL AND Negeri <> ''
				 GROUP BY Negeri
				 ORDER BY total DESC
				 LIMIT 5`
			),
			query(
				`SELECT COUNT(*) AS total,
				        AVG(NULLIF(age, 0)) AS avg_age,
				        SUM(CASE WHEN voters_pru15 = 1 THEN 1 ELSE 0 END) AS voters_pru15,
				        SUM(CASE WHEN voters_prn15 = 1 THEN 1 ELSE 0 END) AS voters_prn15
				 FROM dpi_202412`
			),
			query(
				`SELECT COALESCE(NULLIF(kodJantina, ''), 'Unknown') AS label,
				        COUNT(*) AS total
				 FROM dpi_202412
				 GROUP BY label
				 ORDER BY total DESC`
			),
			query(
				`SELECT SUM(CASE WHEN age BETWEEN 18 AND 29 THEN 1 ELSE 0 END) AS age_18_29,
				        SUM(CASE WHEN age BETWEEN 30 AND 39 THEN 1 ELSE 0 END) AS age_30_39,
				        SUM(CASE WHEN age BETWEEN 40 AND 49 THEN 1 ELSE 0 END) AS age_40_49,
				        SUM(CASE WHEN age BETWEEN 50 AND 59 THEN 1 ELSE 0 END) AS age_50_59,
				        SUM(CASE WHEN age >= 60 THEN 1 ELSE 0 END) AS age_60_plus
				 FROM dpi_202412`
			)
		]);

		const people = peopleRows.map((row) => ({
			id: row.id != null ? String(row.id) : '',
			name: row.name ?? null,
			age: row.age ? toNumber(row.age) : null,
			state: row.state ?? null,
			parliament: row.parliament ?? null,
			dun: row.dun ?? null
		}));

		const topStates = topStateRows.map((row) => ({
			state: row.state ?? 'Unknown',
			total: toNumber(row.total)
		}));

		const statsRow = statsRows[0] ?? {};
		const stats = {
			total: toNumber(statsRow.total ?? 0),
			avgAge: statsRow.avg_age != null ? Number(statsRow.avg_age) : null,
			votersPru15: toNumber(statsRow.voters_pru15 ?? 0),
			votersPrn15: toNumber(statsRow.voters_prn15 ?? 0)
		};

		const genderBreakdown = genderRows.map((row) => ({
			label: row.label ?? 'Unknown',
			total: toNumber(row.total)
		}));

		const ageRow = ageRows[0] ?? {};
		const ageBuckets = [
			{ label: '18-29', total: toNumber(ageRow.age_18_29 ?? 0) },
			{ label: '30-39', total: toNumber(ageRow.age_30_39 ?? 0) },
			{ label: '40-49', total: toNumber(ageRow.age_40_49 ?? 0) },
			{ label: '50-59', total: toNumber(ageRow.age_50_59 ?? 0) },
			{ label: '60+', total: toNumber(ageRow.age_60_plus ?? 0) }
		].filter((bucket) => bucket.total > 0);

		return {
			people,
			topStates,
			stats,
			genderBreakdown,
			ageBuckets
		};
	} catch (err) {
		console.error('Failed to load data from dpi_202412', err);
		throw error(500, 'Unable to load dashboard data');
	}
};
