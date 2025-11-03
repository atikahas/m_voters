<script>
	export let data;

	const formatNumber = (value) => {
		const num = Number(value ?? 0);
		return Number.isNaN(num) ? '0' : num.toLocaleString();
	};

	const formatPercentage = (part, total) => {
		const numerator = Number(part ?? 0);
		const denominator = Number(total ?? 0);

		if (!denominator) {
			return '0%';
		}

		return `${Math.round((numerator / denominator) * 100)}%`;
	};

	let maxAgeBucket = 0;
	let totalGenderCount = 0;

	$: maxAgeBucket = Array.isArray(data?.ageBuckets)
		? data.ageBuckets.reduce((max, bucket) => Math.max(max, Number(bucket.total ?? 0)), 0)
		: 0;

	$: totalGenderCount = Array.isArray(data?.genderBreakdown)
		? data.genderBreakdown.reduce((sum, item) => sum + Number(item.total ?? 0), 0)
		: 0;

	const bucketWidth = (total) => {
		const value = Number(total ?? 0);

		if (!maxAgeBucket) {
			return 0;
		}

		return Math.round((value / maxAgeBucket) * 100);
	};
</script>

<h1 class="text-2xl font-semibold">dpi_202412 dashboard</h1>

{#if data?.stats}
	<section class="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded border bg-white p-4 shadow-sm">
			<p class="uppercase tracking-wide text-slate-500">Total voters</p>
			<p class="mt-2 text-2xl font-semibold">{formatNumber(data.stats.total)}</p>
		</div>
		<div class="rounded border bg-white p-4 shadow-sm">
			<p class="uppercase tracking-wide text-slate-500">Average age</p>
			<p class="mt-2 text-2xl font-semibold">
				{data.stats.avgAge != null ? Number(data.stats.avgAge).toFixed(1) : '—'}
			</p>
			<p class="mt-1 text-slate-500">Ignoring entries with 0 age</p>
		</div>
		<div class="rounded border bg-white p-4 shadow-sm">
			<p class="uppercase tracking-wide text-slate-500">PRU15 voters</p>
			<p class="mt-2 text-2xl font-semibold">{formatNumber(data.stats.votersPru15)}</p>
		</div>
		<div class="rounded border bg-white p-4 shadow-sm">
			<p class="uppercase tracking-wide text-slate-500">PRN15 voters</p>
			<p class="mt-2 text-2xl font-semibold">{formatNumber(data.stats.votersPrn15)}</p>
		</div>
	</section>
{/if}

<section class="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
	<div class="space-y-6">
		{#if data?.ageBuckets?.length}
			<section class="rounded border bg-white p-4 shadow-sm">
				<h2 class="text-lg font-medium">Age distribution</h2>
				<ul class="mt-4 space-y-3 text-sm">
					{#each data.ageBuckets as bucket (bucket.label)}
						<li>
							<div class="flex items-center justify-between">
								<span class="font-medium">{bucket.label}</span>
								<span class="text-slate-600">{formatNumber(bucket.total)}</span>
							</div>
							<div class="mt-2 h-2 rounded-full bg-slate-200">
								<div
									class="h-full rounded-full bg-sky-500"
									style={`width: ${bucketWidth(bucket.total)}%`}
								></div>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<section class="rounded border bg-white p-4 shadow-sm">
			<h2 class="text-lg font-medium">Latest records</h2>

			{#if data?.people?.length}
				<div class="mt-3 overflow-x-auto">
					<table class="min-w-full border-collapse text-sm">
						<thead>
							<tr class="border-b text-left">
								<th class="py-2 pr-4">People ID</th>
								<th class="py-2 pr-4">Name</th>
								<th class="py-2 pr-4">Age</th>
								<th class="py-2 pr-4">State</th>
								<th class="py-2 pr-4">Parliament</th>
								<th class="py-2 pr-4">DUN</th>
							</tr>
						</thead>
						<tbody>
							{#each data.people as person (person.id)}
								<tr class="border-b last:border-0">
									<td class="py-2 pr-4 font-mono text-xs">{person.id}</td>
									<td class="py-2 pr-4">{person.name ?? '—'}</td>
									<td class="py-2 pr-4">{person.age ?? '—'}</td>
									<td class="py-2 pr-4">{person.state ?? '—'}</td>
									<td class="py-2 pr-4">{person.parliament ?? '—'}</td>
									<td class="py-2 pr-4">{person.dun ?? '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="mt-3 text-slate-600">No records found.</p>
			{/if}
		</section>
	</div>

	<div class="space-y-6">
		{#if data?.topStates?.length}
			<section class="rounded border bg-white p-4 shadow-sm">
				<h2 class="text-lg font-medium">Top states by voters</h2>
				<ol class="mt-3 space-y-2 text-sm">
					{#each data.topStates as state, index (state.state)}
						<li class="flex items-center justify-between rounded border px-3 py-2">
							<span>
								<span class="mr-2 text-slate-500">#{index + 1}</span>
								<span class="font-semibold">{state.state}</span>
							</span>
							<span class="text-slate-600">{formatNumber(state.total)}</span>
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		{#if data?.genderBreakdown?.length}
			<section class="rounded border bg-white p-4 shadow-sm">
				<h2 class="text-lg font-medium">Gender breakdown</h2>
				<ul class="mt-3 space-y-2 text-sm">
					{#each data.genderBreakdown as item (item.label)}
						<li class="flex items-center justify-between rounded px-3 py-2 odd:bg-slate-50">
							<span class="font-semibold">{item.label}</span>
							<span class="text-slate-600">
								{formatNumber(item.total)}
								<span class="ml-1 text-xs text-slate-500">
									{formatPercentage(item.total, totalGenderCount)}
								</span>
							</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
</section>
