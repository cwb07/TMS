<script>
	import { goto } from '$app/navigation';
	import axios from 'axios';
	import { USER_URL } from '$lib/constants';

	export let data;

	const logout = async (e) => {
		e.preventDefault();

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
			invalidate('loadUserCheck');
		}
	};
</script>

<nav class="navbar navbar-expand-lg" style="background-color: #99cdf4; margin-bottom: 10px">
	<div class="container-fluid">
		<span class="navbar-brand" id="userId" style="flex-grow: 1; text-align: left;">
			<b>Welcome, {data.username}</b>
		</span>

		{#if data.isAdmin}
			<a class="navbar-brand mx-auto" href="/user_management"
				><u><b>USER MANAGEMENT SYSTEM</b></u></a
			>
			&nbsp;|&nbsp;
			<a class="navbar-brand mx-auto" href="/task_management"
				><u><b>TASK MANAGEMENT SYSTEM</b></u></a
			>
		{:else}
			<a class="navbar-brand mx-auto" href="/task_management"><b>TASK MANAGEMENT SYSTEM</b></a>
		{/if}

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
