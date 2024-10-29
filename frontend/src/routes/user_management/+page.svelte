<script>
	export let form;
</script>

<nav class="navbar navbar-expand-lg" style="background-color: #99cdf4; margin-bottom: 10px">
	<div class="container-fluid">
		<span class="navbar-brand" id="userId" style="flex-grow: 1; text-align: left;">
			<b>Welcome, USERID</b>
		</span>

		<a class="navbar-brand mx-auto" href="/user_management"><u><b>USER MANAGEMENT SYSTEM</b></u></a>
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
						href="/user_management"
						style="margin-right: 10px;">Edit Profile</a
					>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-dark rounded px-2 py-1" href="/user_management">Logout</a
					>
				</li>
			</ul>
		</div>
	</div>
</nav>

<div style="padding: 20px">
	<!-- Page Title and Welcome Message -->
	<div class="row mb-3">
		<div class="col-12">
			<h1>User Management</h1>
		</div>
	</div>

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
				<div class="alert alert-success" role="alert" id="successAlert">{form?.success}</div>
			</div>
		</div>
	{/if}

	<!-- Create Group Table -->
	<div class="row">
		<div class="col-6"></div>
		<div class="col-6">
			<form method="POST" action="?/createGroup">
				<table class="table table-bordered text-center">
					<tbody>
						<tr>
							<th
								><input
									type="text"
									class="form-control"
									placeholder="Group Name"
									name="groupname"
								/></th
							>
							<th><button type="submit" class="btn btn-primary w-100">Create Group</button> </th>
						</tr>
					</tbody>
				</table>
			</form>
		</div>
	</div>

	<!-- Create User Table -->
	<div class="row">
		<div class="col-12">
			<table class="table table-bordered text-center">
				<tbody>
					<tr>
						<th><input type="text" class="form-control" placeholder="Username" /></th>
						<th><input type="text" class="form-control" placeholder="Email" /></th>
						<th><input type="text" class="form-control" placeholder="Password" /></th>
						<th><input type="text" class="form-control" placeholder="Group" /></th>
						<th><input type="text" class="form-control" placeholder="Active" /></th>
						<th><button type="submit" class="btn btn-primary w-100">Create User</button> </th>
					</tr>
				</tbody>
			</table>
		</div>
	</div>

	<!-- User Table -->
	<div class="row">
		<div class="col-12">
			<table class="table table-bordered text-center">
				<thead class="table-light">
					<tr>
						<th>Username</th>
						<th>Email</th>
						<th>Password</th>
						<th>Group</th>
						<th>Active</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>user1</td>
						<td>user2</td>
						<td>user1</td>
						<td>user2</td>
						<td>user1</td>
						<td>user2</td>
					</tr>
					<tr>
						<td>user1</td>
						<td>user2</td>
						<td>user1</td>
						<td>user2</td>
						<td>user1</td>
						<td>user2</td>
					</tr>
					<tr>
						<td>user1</td>
						<td>user2</td>
						<td>user1</td>
						<td>user2</td>
						<td>user1</td>
						<td>user2</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
	.right-aligned-table {
		display: block;
		margin-left: auto;
		margin-right: 0;
	}
</style>
