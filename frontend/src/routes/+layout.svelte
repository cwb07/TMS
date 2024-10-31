<script>
	export let data;
</script>

{#if data.user}
	<p>Welcome, {data.user}!</p>
{:else}
	<p>Please log in.</p>
{/if}

<slot />
