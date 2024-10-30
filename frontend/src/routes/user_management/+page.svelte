<script>
	import { enhance } from '$app/forms';

	// data from form actions
	export let form;

	// loaded data
	export let data;

	// form values
	$: groupname = form?.groupname;
	$: username = '' || form?.formData?.username;
	$: email = '' || form?.formData?.email;
	$: password = '' || form?.formData?.password;
	$: accountstatus = 'Active' || form?.formData?.accountstatus;

	// store data from server into groupsList list
	$: groupsList = data.groupsList;
	$: selectedGroups = form?.formData?.groups.length > 0 ? form?.formData?.groups : [];

	// select logic
	let isDropdownOpen = false;

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}

	function selectGroup(group) {
		if (!selectedGroups.includes(group)) {
			selectedGroups = [...selectedGroups, group];
		}
	}

	function removeGroup(groupToRemove) {
		selectedGroups = selectedGroups.filter((group) => group !== groupToRemove);
	}

	// close dropdown when clicking outside
	function handleClickOutside(event) {
		const multiSelect = event.target.closest('.multi-select-container');
		if (!multiSelect) {
			isDropdownOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

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
			<form method="POST" action="?/createGroup" use:enhance>
				<table class="table table-bordered text-center">
					<tbody>
						<tr>
							<th
								><input
									type="text"
									class="form-control"
									placeholder="Group Name"
									name="groupname"
									bind:value={groupname}
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
			<form method="POST" action="?/createUser" use:enhance>
				<table class="table table-bordered text-center">
					<tbody>
						<tr>
							<th
								><input
									type="text"
									class="form-control"
									name="username"
									placeholder="Username*"
									bind:value={username}
								/></th
							>
							<th
								><input
									type="text"
									class="form-control"
									name="email"
									placeholder="Email (optional)"
									bind:value={email}
								/></th
							>
							<th
								><input
									type="text"
									class="form-control"
									name="password"
									placeholder="Password*"
									bind:value={password}
								/></th
							>
							<th>
								<input type="hidden" name="selectedGroups" bind:value={selectedGroups} />
								<div class="multi-select-container">
									<button
										type="button"
										class="form-control multi-select-field"
										on:click={toggleDropdown}
										on:keydown={(e) => e.key === 'Enter' && toggleDropdown()}
										aria-haspopup="listbox"
									>
										{#if selectedGroups.length === 0}
											<span class="text-muted">Select groups (Optional)</span>
										{:else}
											{#each selectedGroups as group}
												<div class="selected-item">
													{group}
													<span
														class="remove-item"
														on:click|stopPropagation={() => removeGroup(group)}
														on:keydown={(e) => e.key === 'Enter' && removeGroup(group)}
														aria-label="Remove group"
														role="button"
														tabindex="0"
													>
														&times;
													</span>
												</div>
											{/each}
										{/if}
									</button>
									<div class="dropdown-menu {isDropdownOpen ? 'show' : ''}">
										{#each groupsList as group}
											<button
												type="button"
												class="dropdown-item"
												on:click={() => selectGroup(group)}
												on:keydown={(e) => e.key === 'Enter' && selectGroup(group)}
												role="menuitem"
											>
												{group}
											</button>
										{/each}
									</div>
								</div>
							</th>
							<th
								><select class="form-select" name="accountstatus" bind:value={accountstatus}>
									<option default value="Active">Active</option>
									<option value="Disabled">Disabled</option>
								</select>
							</th>
							<th><button type="submit" class="btn btn-primary w-100">Create User</button> </th>
						</tr>
					</tbody>
				</table>
			</form>
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
