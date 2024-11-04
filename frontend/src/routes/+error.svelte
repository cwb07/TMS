<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { USER_URL } from '$lib/constants';
	import { goto } from '$app/navigation';

	let countdown = 3;

	onMount(() => {
		if ($page.error.redirect) {
			const interval = setInterval(async () => {
				if (countdown > 0) {
					countdown -= 1;
				} else {
					clearInterval(interval);
					// clear cookies
					try {
						const response = await axios.post(
							`${USER_URL}/logout`,
							{},
							{
								headers: {
									'Content-Type': 'application/json'
								},
								withCredentials: true
							}
						);

						if (response.status === 200) {
							goto('/login');
						}
					} catch (err) {
						console.error('Logout failed:', err);
						goto('/login');
					}
				}
			}, 1000);
		}
	});
</script>

<h1>{$page.status}: {$page.error.message}</h1>

{#if $page.error.redirect}
	<p>Redirecting in {countdown}s...</p>
{/if}
