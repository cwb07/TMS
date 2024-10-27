<script>
	export let form;
</script>

<div class="container">
	<div class="row justify-content-center align-items-center vh-100">
		<div class="col-md-6 col-lg-4">
			<div class="card">
				<div class="card-body">
					<h3 class="card-title text-center mb-4">Login</h3>
					{#if form?.error}
						<div class="alert alert-danger" role="alert">{form?.error}</div>
					{/if}
					<form method="POST">
						<div class="mb-3">
							<label for="username" class="form-label">Username</label>
							<input id="username" name="username" class="form-control" />
						</div>
						<div class="mb-3">
							<label for="password" class="form-label">Password</label>
							<input id="password" name="password" class="form-control" />
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
