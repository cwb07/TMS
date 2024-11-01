<script>
	import { USER_URL } from '$lib/constants';
	import { goto } from '$app/navigation';
	import axios from 'axios';

	let username = '';
	let password = '';
	let error = '';

	const submitHandler = async (e) => {
		e.preventDefault();

		if (username && password) {
			const response = await axios.post(
				`${USER_URL}/login`,
				{
					username,
					password
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true
				}
			);

			if (response.status === 200) {
				goto('/user_management');
			} else {
				error = 'Invalid credentials';
			}
		}

		error = 'Invalid credentials';
	};
</script>

<div class="container">
	<div class="row justify-content-center align-items-center vh-100">
		<div class="col-md-6 col-lg-4">
			<div class="card">
				<div class="card-body">
					<h3 class="card-title text-center mb-4">Login</h3>
					{#if error}
						<div class="alert alert-danger" role="alert">Error: {error}</div>
					{/if}
					<form on:submit={submitHandler}>
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

<style>
	:global(body) {
		background-color: #f5f5f5; /* Light grey background */
	}
</style>
