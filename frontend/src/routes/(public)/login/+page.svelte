<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	export let form;

	$: errorMessage = '' || form?.errorMessage;

	$: if (form?.loginSuccess) {
		goto('/task_management');
	}

	let username = '';
	let password = '';
</script>

<div class="login-background">
	<div class="container">
		<div class="row justify-content-center align-items-center vh-100">
			<div class="col-md-6 col-lg-4">
				<div class="card">
					<div class="card-body">
						<h3 class="card-title text-center mb-4">Login</h3>
						{#if errorMessage}
							<div class="alert alert-danger" role="alert">Error: {errorMessage}</div>
						{/if}
						<form
							method="POST"
							use:enhance={() => {
								return async ({ update }) => {
									update({ reset: false });
								};
							}}
						>
							<div class="mb-3">
								<label for="username" class="form-label">Username</label>
								<input id="username" name="username" class="form-control" bind:value={username} />
							</div>
							<div class="mb-3">
								<label for="password" class="form-label">Password</label>
								<input
									id="password"
									type="password"
									name="password"
									class="form-control"
									bind:value={password}
								/>
							</div>
							<button type="submit" class="btn btn-primary w-100">Log In</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.login-background {
		background-color: #f5f5f5;
	}
</style>
