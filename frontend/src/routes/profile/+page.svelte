<script>
	import { enhance } from '$app/forms';

	export let data;
	export let form;

	$: email = '' || form?.formData?.email;
	$: password = '' || form?.formData?.password;
</script>

<div class="container">
	<div class="row justify-content-center align-items-center" style="margin-top: 200px">
		<div class="col-md-6 col-lg-4">
			<div class="card">
				<div class="card-body">
					<h3 class="card-title text-center mb-4">Update Info</h3>
					<!-- Error Message Display -->
					{#if form?.error}
						<div class="row mb-2">
							<div class="col-12">
								<div class="alert alert-danger" role="alert" id="errorAlert">{form?.error}</div>
							</div>
						</div>
					{/if}

					<!-- Success Message Display -->
					{#if form?.success}
						<div class="row mb-2">
							<div class="col-12">
								<div class="alert alert-success" role="alert" id="successAlert">
									{form?.success}
								</div>
							</div>
						</div>
					{/if}
					<form method="POST" use:enhance>
						<input type="hidden" name="username" value={data.username} />
						<div class="mb-3">
							<label for="email" class="form-label">Current Email Address</label>
							{#if data.email}
								<p id="email"><b>{data.email}</b></p>
							{:else}
								<p id="email"><b>No email</b></p>
							{/if}
						</div>
						<div class="mb-3">
							<label for="email" class="form-label">New Email</label>
							<input id="email" name="email" class="form-control" bind:value={email} />
						</div>
						<div class="mb-3">
							<label for="password" class="form-label">New Password</label>
							<input
								id="password"
								type="password"
								name="password"
								class="form-control"
								bind:value={password}
							/>
						</div>
						<button type="submit" class="btn btn-primary w-100">Update</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
