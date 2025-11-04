<script>
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';

	export let data;

	const formatNumber = (value) => {
		const num = Number(value ?? 0);
		return Number.isFinite(num) ? num.toLocaleString('en-US') : '0';
	};

const chartMeta = {
	total: {
		title: 'Pecahan Bangsa (Current Voters)',
		seriesLabel: 'Current',
		color: 'rgba(37, 99, 235, 0.85)'
		},
		pru15: {
			title: 'Pecahan Bangsa (PRU15 Voters)',
			seriesLabel: 'PRU15',
			color: 'rgba(16, 185, 129, 0.85)'
		},
		prn15: {
			title: 'Pecahan Bangsa (PRN15 Voters)',
			seriesLabel: 'PRN15',
			color: 'rgba(245, 158, 11, 0.85)'
	}
};

const raceColors = {
	M: { fill: 'rgba(37, 99, 235, 0.85)', border: 'rgba(37, 99, 235, 1)' }, // Blue
	C: { fill: 'rgba(239, 68, 68, 0.85)', border: 'rgba(239, 68, 68, 1)' }, // Red
	I: { fill: 'rgba(249, 115, 22, 0.85)', border: 'rgba(249, 115, 22, 1)' }, // Orange
	L: { fill: 'rgba(234, 179, 8, 0.85)', border: 'rgba(234, 179, 8, 1)' }, // Yellow
	Q: { fill: 'rgba(168, 85, 247, 0.85)', border: 'rgba(168, 85, 247, 1)' }, // Sarawak - Purple
	S: { fill: 'rgba(14, 165, 233, 0.85)', border: 'rgba(14, 165, 233, 1)' }, // Sabah - Sky
	UNKNOWN: { fill: 'rgba(148, 163, 184, 0.65)', border: 'rgba(148, 163, 184, 1)' } // Neutral fallback
};

const valueLabelPlugin = {
	id: 'valueLabel',
	afterDatasetsDraw(chart) {
		const { ctx, chartArea } = chart;
		ctx.save();
		const font = '12px "Inter", system-ui, sans-serif';
		ctx.font = font;
		ctx.textBaseline = 'middle';

		chart.data.datasets.forEach((dataset, datasetIndex) => {
			const meta = chart.getDatasetMeta(datasetIndex);
			meta.data.forEach((element, index) => {
				const rawValue = dataset.data[index];
				if (rawValue == null) return;

				const { x, base, y } = element.getProps(['x', 'base', 'y'], true);
				const formatted = formatNumber(rawValue);
				const textWidth = ctx.measureText(formatted).width;
				const space = Math.abs(x - base);
				const insidePadding = 8;
				const outsidePadding = 8;
				const canFitInside = space > textWidth + insidePadding * 2;

				let textX;
				if (canFitInside) {
					textX = x - insidePadding;
					ctx.textAlign = 'right';
					ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
				} else {
					textX = Math.min(x + outsidePadding, chartArea.right - textWidth);
					ctx.textAlign = 'left';
					ctx.fillStyle = 'rgb(51, 65, 85)';
				}

				ctx.fillText(formatted, textX, y);
			});
		});

		ctx.restore();
	}
};

let ChartJS;
let totalCanvas;
let pru15Canvas;
let prn15Canvas;

	const charts = {
		total: null,
		pru15: null,
		prn15: null
	};

	$: totalVoters = data?.stats?.total ?? 0;
	$: pru15Voters = data?.stats?.votersPru15 ?? 0;
	$: prn15Voters = data?.stats?.votersPrn15 ?? 0;
	$: raceBreakdown = data?.raceBreakdown ?? [];
	$: chartHeight = raceBreakdown.length ? Math.max(raceBreakdown.length * 36, 220) : 220;
	$: globalRaceMax = raceBreakdown.length
		? Math.max(
				...raceBreakdown.flatMap((race) => [race.total ?? 0, race.pru15 ?? 0, race.prn15 ?? 0])
			)
		: 0;

	const getCanvasForKey = (key) => {
		if (key === 'total') return totalCanvas;
		if (key === 'pru15') return pru15Canvas;
		if (key === 'prn15') return prn15Canvas;
		return null;
	};

const calculateStepSize = (maxValue) => {
	if (maxValue <= 0) return undefined;
	const roughStep = maxValue / 5;
	const magnitude = 10 ** Math.floor(Math.log10(roughStep || 1));
	const normalized = roughStep / magnitude;
	const step = normalized < 2 ? 2 : normalized < 5 ? 5 : 10;
	return step * magnitude;
};

const getChartOptions = (meta, maxValue) => ({
	indexAxis: 'y',
	responsive: true,
	maintainAspectRatio: false,
	scales: {
		x: {
			min: 0,
			max: maxValue > 0 ? maxValue : undefined,
			suggestedMax: maxValue > 0 ? maxValue : undefined,
			border: {
				color: 'rgba(148, 163, 184, 0.6)'
			},
			grid: {
				color: 'rgba(226, 232, 240, 0.4)'
			},
			ticks: {
				color: 'rgb(100, 116, 139)',
				padding: 6,
				font: {
					family: '"Inter", system-ui, sans-serif',
					size: 11
				},
				callback: (value) => formatNumber(value),
				stepSize: calculateStepSize(maxValue)
			}
		},
		y: {
			grid: {
				display: false
			},
			ticks: {
				color: 'rgb(100, 116, 139)',
				padding: 8,
				font: {
					size: 12,
					family: '"Inter", system-ui, sans-serif'
				}
			}
		}
	},
		plugins: {
			legend: {
				display: false
			},
			tooltip: {
				callbacks: {
					label: (context) => {
						const value = context.parsed?.x ?? context.parsed ?? 0;
						return `${meta.seriesLabel}: ${formatNumber(value)}`;
					}
				}
			}
		},
		layout: {
			padding: {
				top: 6,
				bottom: 6,
				left: 6,
				right: 12
			}
		}
	});

	const ensureChart = (key) => {
		if (!ChartJS) return;

		const canvas = getCanvasForKey(key);
		if (!canvas) return;

	const meta = chartMeta[key];
	const maxValue = globalRaceMax;
	const labels = raceBreakdown.map((race) => `${race.label} (${race.code})`);
	const values = raceBreakdown.map((race) => race[key] ?? 0);
	const colors = raceBreakdown.map((race) => raceColors[race.code]?.fill ?? raceColors.UNKNOWN.fill);
	const borderColors = raceBreakdown.map(
		(race) => raceColors[race.code]?.border ?? raceColors.UNKNOWN.border
	);

	if (charts[key]) {
		charts[key].data.labels = labels;
		charts[key].data.datasets[0].data = values;
		charts[key].data.datasets[0].backgroundColor = colors;
		charts[key].data.datasets[0].borderColor = borderColors;
		if (charts[key].options?.scales?.x) {
			const stepSize = calculateStepSize(maxValue);
			charts[key].options.scales.x.max = maxValue > 0 ? maxValue : undefined;
			charts[key].options.scales.x.suggestedMax = maxValue > 0 ? maxValue : undefined;
			charts[key].options.scales.x.ticks.stepSize = stepSize || undefined;
		}
		charts[key].update();
		charts[key].resize();
		return;
	}

		charts[key] = new ChartJS(canvas.getContext('2d'), {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: meta.seriesLabel,
						data: values,
						backgroundColor: colors,
						borderColor: borderColors,
						borderWidth: 1,
						borderRadius: 6,
						maxBarThickness: 28
					}
				]
			},
			options: getChartOptions(meta, maxValue)
		});
	};

	const updateCharts = () => {
		if (!ChartJS || !browser) return;
		if (!raceBreakdown.length) {
			destroyCharts();
			return;
		}

		ensureChart('total');
		ensureChart('pru15');
		ensureChart('prn15');
	};

	const destroyCharts = () => {
		Object.keys(charts).forEach((key) => {
			if (charts[key]) {
				charts[key].destroy();
				charts[key] = null;
			}
		});
	};

	onMount(async () => {
		if (!browser) return;
		const module = await import('chart.js/auto');
		ChartJS = module.default;
		ChartJS.register(valueLabelPlugin);
		updateCharts();
	});

	onDestroy(() => {
		destroyCharts();
	});

	$: if (ChartJS) {
		updateCharts();
	}
</script>

<div class="mb-2 flex w-full flex-wrap gap-2 lg:flex-nowrap">
	<div class="flex flex-1">
		<select class="py-1 px-4 pe-9 block w-full border-neutral-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
			<option value="">Semua Negeri</option>
		</select>
	</div>
	<div class="flex flex-1">
		<select class="py-1 px-4 pe-9 block w-full border-neutral-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
			<option value="">Semua Parlimen</option>
		</select>
	</div>
	<div class="flex flex-1">
		<select class="py-1 px-4 pe-9 block w-full border-neutral-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
			<option value="">Semua DUN</option>
		</select>
	</div>
	<div class="flex flex-1">
		<select class="py-1 px-4 pe-9 block w-full border-neutral-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
			<option value="">Semua DM</option>
		</select>
	</div>
	<div class="flex flex-1">
		<div class="w-full">
			<label for="search" class="sr-only">Carian</label>
			<div class="relative">
				<input type="text" id="search" name="search" class="py-2 px-3 ps-11 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" placeholder="Search"/>
				<div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4">
					<svg class="shrink-0 size-4 text-gray-400 dark:text-neutral-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
	<div class="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-700 dark:bg-neutral-800">
		<div class="p-4 md:p-5">
			<div class="flex items-center gap-x-2">
				<p class="text-xs uppercase text-neutral-500 dark:text-neutral-500">Jumlah Pengundi Semasa</p>
			</div>
			<div class="mt-1 flex items-center gap-x-2">
				<h3 class="text-xl font-medium text-neutral-800 dark:text-neutral-200 sm:text-2xl">
					{formatNumber(totalVoters)}
				</h3>
			</div>
		</div>
	</div>

	<div class="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-700 dark:bg-neutral-800">
		<div class="p-4 md:p-5">
			<div class="flex items-center gap-x-2">
				<p class="text-xs uppercase text-neutral-500 dark:text-neutral-500">Jumlah Pengundi PRU15</p>
			</div>
			<div class="mt-1 flex items-center gap-x-2">
				<h3 class="text-xl font-medium text-neutral-800 dark:text-neutral-200 sm:text-2xl">
					{formatNumber(pru15Voters)}
				</h3>
			</div>
		</div>
	</div>

	<div class="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-700 dark:bg-neutral-800">
		<div class="p-4 md:p-5">
			<div class="flex items-center gap-x-2">
				<p class="text-xs uppercase text-neutral-500 dark:text-neutral-500">Jumlah Pengundi PRN15</p>
			</div>
			<div class="mt-1 flex items-center gap-x-2">
				<h3 class="text-xl font-medium text-neutral-800 dark:text-neutral-200 sm:text-2xl">
					{formatNumber(prn15Voters)}
				</h3>
			</div>
		</div>
	</div>
</div>

{#if raceBreakdown.length}
	<div class="mt-2 grid gap-2 lg:grid-cols-3">
		<div class="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-700 dark:bg-neutral-800">
			<div class="p-4 md:p-5">
				<div class="flex items-start justify-between gap-4">
					<div>
						<h3 class="text-base font-semibold text-neutral-800 dark:text-neutral-100">
							Semasa
						</h3>
						<p class="text-sm text-neutral-500 dark:text-neutral-400">Pengundi semasa mengikut bangsa.</p>
					</div>
				</div>
				<div
					class="mt-4 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900/50"
					style={`height: ${chartHeight}px;`}
				>
					<canvas bind:this={totalCanvas} class="h-full w-full"></canvas>
				</div>
			</div>
		</div>

		<div class="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-700 dark:bg-neutral-800">
			<div class="p-4 md:p-5">
				<div class="flex items-start justify-between gap-4">
					<div>
						<h3 class="text-base font-semibold text-neutral-800 dark:text-neutral-100">
							PRU15
						</h3>
						<p class="text-sm text-neutral-500 dark:text-neutral-400">Pengundi PRU15 mengikut bangsa.</p>
					</div>
				</div>
				<div
					class="mt-4 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900/50"
					style={`height: ${chartHeight}px;`}
				>
					<canvas bind:this={pru15Canvas} class="h-full w-full"></canvas>
				</div>
			</div>
		</div>

		<div class="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-700 dark:bg-neutral-800">
			<div class="p-4 md:p-5">
				<div class="flex items-start justify-between gap-4">
					<div>
						<h3 class="text-base font-semibold text-neutral-800 dark:text-neutral-100">
							PRN15
						</h3>
						<p class="text-sm text-neutral-500 dark:text-neutral-400">Pengundi PRN15 mengikut bangsa.</p>
					</div>
				</div>
				<div
					class="mt-4 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900/50"
					style={`height: ${chartHeight}px;`}
				>
					<canvas bind:this={prn15Canvas} class="h-full w-full"></canvas>
				</div>
			</div>
		</div>
	</div>

{/if}
