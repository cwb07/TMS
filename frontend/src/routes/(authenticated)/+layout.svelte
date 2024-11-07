<script>
	import { goto } from '$app/navigation';
	import axios from 'axios';
	import { API_URL } from '$lib/constants';
	import { page } from '$app/stores';

	export let data;

	const logout = async (e) => {
		e.preventDefault();

		try {
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

			if (response.status === 200) {
				goto('/login');
			}
		} catch (err) {
			goto('/login');
		}
	};
</script>

<nav class="navbar navbar-expand-lg py-3" style="background-color: #99cdf4; margin-bottom: 10px">
	<div class="container-fluid">
		<span class="navbar-brand" id="userId" style="flex-grow: 1; text-align: left;">
			<b>Welcome, {data.username}</b>
		</span>

		{#if data.isAdmin}
			<a
				class="navbar-brand mx-auto"
				href="/user_management"
				class:underline={$page.url.pathname.includes('/user_management')}
				><b>USER MANAGEMENT SYSTEM</b></a
			>
			&nbsp;|&nbsp;
		{/if}
		<a
			class="navbar-brand mx-auto"
			href="/task_management"
			class:underline={$page.url.pathname.includes('/task_management')}
			><b>TASK MANAGEMENT SYSTEM</b></a
		>

		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarNav"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="navbarNav">
			<ul class="navbar-nav ms-auto">
				<li class="nav-item">
					<a
						class="nav-link border border-dark rounded px-2 py-1"
						href="/profile"
						style="margin-right: 10px;">Edit Profile</a
					>
				</li>
				<li class="nav-item">
					<a href="/logout" class="nav-link border border-dark rounded px-2 py-1" on:click={logout}
						>Logout</a
					>
				</li>
			</ul>
		</div>
	</div>
</nav>

<slot />

<style>
	.underline {
		text-decoration: underline;
	}
</style>
