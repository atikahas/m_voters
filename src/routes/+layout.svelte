<svelte:options runes={true} />

<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	const STORAGE_KEY = 'hs_theme';

	let { children } = $props();
	let theme = $state('light');
	let ready = $state(false);

	const prefersDark = () => (browser ? window.matchMedia('(prefers-color-scheme: dark)').matches : false);

	const resolveTheme = () => {
		if (!browser) return theme;

		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'dark' || stored === 'light') {
			return stored;
		}

		return prefersDark() ? 'dark' : 'light';
	};

	const applyTheme = (value) => {
		if (!browser) return;
		const html = document.documentElement;
		html.classList.remove('dark', 'light');
		html.classList.add(value === 'dark' ? 'dark' : 'light');
	};

	const setTheme = (value) => {
		if (!browser) return;
		theme = value === 'dark' ? 'dark' : 'light';
		localStorage.setItem(STORAGE_KEY, theme);
		applyTheme(theme);
	};

	onMount(() => {
		theme = resolveTheme();
		applyTheme(theme);
		ready = true;

		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const listener = (event) => {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored || stored === 'auto') {
				theme = event.matches ? 'dark' : 'light';
				applyTheme(theme);
			}
		};

		media.addEventListener('change', listener);

		return () => {
			media.removeEventListener('change', listener);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>


<header class="relative flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-white text-sm py-1 dark:bg-neutral-800">
    <nav class="w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
		<div class="flex items-center justify-between">
		<a class="flex-none text-xl font-semibold dark:text-white focus:outline-hidden focus:opacity-80" href="/" aria-label="Brand">
			Voters
		</a>
		<div class="sm:hidden">
			<button type="button" class="hs-collapse-toggle relative size-9 flex justify-center items-center gap-x-2 rounded-lg border border-neutral-200 bg-white text-neutral-800 shadow-2xs hover:bg-neutral-50 focus:outline-hidden focus:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-transparent dark:border-neutral-700 dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10" id="hs-navbar-example-collapse" aria-expanded="false" aria-controls="hs-navbar-example" aria-label="Toggle navigation" data-hs-collapse="#hs-navbar-example">
			<svg class="hs-collapse-open:hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
			<svg class="hs-collapse-open:block hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
			<span class="sr-only">Toggle navigation</span>
			</button>
		</div>
		</div>
		<div id="hs-navbar-example" class="hidden hs-collapse overflow-hidden transition-all duration-300 basis-full grow sm:block" aria-labelledby="hs-navbar-example-collapse">
			<div class="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
				<button type="button" class="block font-medium text-neutral-800 rounded-md hover:bg-neutral-200 focus:outline-hidden focus:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800" class:hidden={!ready || theme === 'dark'} aria-label="Enable dark theme" onclick={() => setTheme('dark')}>
					<span class="group inline-flex shrink-0 justify-center items-center size-9">
						<svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
						</svg>
					</span>
				</button>
				<button type="button" class="block font-medium text-neutral-800 rounded-md hover:bg-neutral-200 focus:outline-hidden focus:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800" class:hidden={!ready || theme === 'light'} aria-label="Enable light theme" onclick={() => setTheme('light')}>
					<span class="group inline-flex shrink-0 justify-center items-center size-9">
						<svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="4"></circle>
						<path d="M12 2v2"></path>
						<path d="M12 20v2"></path>
						<path d="m4.93 4.93 1.41 1.41"></path>
						<path d="m17.66 17.66 1.41 1.41"></path>
						<path d="M2 12h2"></path>
						<path d="M20 12h2"></path>
						<path d="m6.34 17.66-1.41 1.41"></path>
						<path d="m19.07 4.93-1.41 1.41"></path>
						</svg>
					</span>
				</button>
			</div>
		</div>
	</nav>
</header>

<main id="content" class="bg-neutral-100 text-sm py-2 dark:bg-neutral-900">
	<div class="max-w-full min-h-300 mx-auto px-2">
		{@render children()}
	</div>
</main>
