<script>
	import { page } from '$app/stores';
	export let data;
</script>

{#if $page.url.pathname !== '/login'}
	<nav class="navbar navbar-expand-lg" style="background-color: #99cdf4; margin-bottom: 10px">
		<div class="container-fluid">
			<span class="navbar-brand" id="userId" style="flex-grow: 1; text-align: left;">
				<b>Welcome, {data.username}</b>
			</span>

			<a class="navbar-brand mx-auto" href="/user_management"
				><u><b>USER MANAGEMENT SYSTEM</b></u></a
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
						<a class="nav-link border border-dark rounded px-2 py-1" href="/user_management"
							>Logout</a
						>
					</li>
				</ul>
			</div>
		</div>
	</nav>
{/if}

<slot />
