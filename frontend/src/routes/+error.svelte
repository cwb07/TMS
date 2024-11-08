<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { API_URL } from '$lib/constants';
	import { goto } from '$app/navigation';

	let countdown = 3;

	onMount(() => {
		if ($page.error.redirectToLogin || $page.error.redirectToTMS) {
			const interval = setInterval(async () => {
				if (countdown > 1) {
					countdown -= 1;
				} else {
					clearInterval(interval);
					// clear cookies
					try {
						if ($page.error.redirectToLogin) {
							const response = await axios.post(
								`${API_URL}/logout`,
								{},
								{
									headers: {
										'Content-Type': 'application/json'
									},
									withCredentials: true
								}
							);
							if (response.data.success) {
								goto('/login');
							}
						} else {
							goto('/task_management');
						}
					} catch (err) {
						goto('/login');
					}
				}
			}, 1000);
		}
	});
</script>

<h1>{$page.status}: {$page.error.message}</h1>

{#if $page.error.redirectToLogin || $page.error.redirectToTMS}
	<p>Redirecting in {countdown}s...</p>
{/if}
