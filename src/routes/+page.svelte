<script>
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	export let data;

	const formatNumber = (value) => {
		const num = Number(value ?? 0);
		return Number.isFinite(num) ? num.toLocaleString('en-US') : '0';
	};

	$: totalVoters = data?.stats?.total ?? 0;
</script>

<div class="mb-2 flex w-full flex-wrap gap-2 lg:flex-nowrap">
	<div class="flex flex-1">
		<select class="py-1 px-4 pe-9 block w-full border-neutral-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
			<option value="">All Negeri</option>
		</select>
	</div>
	<div class="flex flex-1">
		<select class="py-1 px-4 pe-9 block w-full border-neutral-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
			<option value="">All Parlimen</option>
		</select>
	</div>
	<div class="flex flex-1">
		<select class="py-1 px-4 pe-9 block w-full border-neutral-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
			<option value="">All DUN</option>
		</select>
	</div>
	<div class="flex flex-1">
		<select class="py-1 px-4 pe-9 block w-full border-neutral-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
			<option value="">All DM</option>
		</select>
	</div>
    <div class="flex flex-1">
		<select class="py-1 px-4 pe-9 block w-full border-neutral-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
			<option value="">PRU / PRN</option>
		</select>
	</div>
	<div class="flex flex-1">
		<div class="w-full">
			<label for="search" class="sr-only">Search</label>
			<div class="relative">
				<input type="text" id="search" name="search" class="py-2 px-3 ps-11 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" placeholder="Search"/>
				<div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4">
					<svg class="shrink-0 size-4 text-gray-400 dark:text-neutral-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="flex flex-col bg-white border border-neutral-200 shadow-2xs rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
	<div class="p-4 md:p-5">
		<div class="flex items-center gap-x-2">
			<p class="text-xs uppercase text-neutral-500 dark:text-neutral-500">
				Total Voters
			</p>
		</div>
		<div class="mt-1 flex items-center gap-x-2">
			<h3 class="text-xl sm:text-2xl font-medium text-neutral-800 dark:text-neutral-200">
				{formatNumber(totalVoters)}
			</h3>
		</div>
	</div>
</div>
