<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let countdown = 3;

	// Start the countdown when the component is first added to the DOM
	onMount(() => {
		if ($page.error.redirect) {
			setInterval(() => {
				if (countdown > 0) {
					countdown -= 1;
				} else {
					goto('/login');
				}
			}, 1000);
		}
	});
</script>

<h1>{$page.status}: {$page.error.message}</h1>

{#if $page.error.redirect}
	<p>Redirecting in {countdown}s...</p>
{/if}
