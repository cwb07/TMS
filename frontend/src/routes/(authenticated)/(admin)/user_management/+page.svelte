<script>
	import { USER_URL, GROUP_URL } from '$lib/constants';
	import { invalidate } from '$app/navigation';
	import axios from 'axios';
	import MultiSelect from 'svelte-multiselect';

	// data from form actions and load
	export let data;
	let errorMessage = '';
	let successMessage = '';

	// load existing groups and users
	$: groupsList = data.groupsList;
	$: usersList = data.usersList;

	// group form fields
	let groupname = '';

	const createGroup = async (e) => {
		e.preventDefault();

		try {
			const response = await axios.post(
				`${GROUP_URL}`,
				{ groupname },
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true
				}
			);

			if (response.status === 201) {
				successMessage = response.data.message;
				errorMessage = '';
				invalidate('loadFetchGroupsUsers');
			}
		} catch (err) {
			if (err.response.status === 403) {
				invalidate('loadAdminCheck');
			} else {
				errorMessage = err.response.data.message;
				successMessage = '';
			}
		}
	};

	// user form fields
	let username = '';
	let email = '';
	let password = '';
	let selectedGroups = [];
	let accountstatus = 'Active';
	$: options = groupsList || [];

	const createUser = async (e) => {
		e.preventDefault();

		try {
			const response = await axios.post(
				`${USER_URL}`,
				{ username, email, password, groups: selectedGroups, accountstatus },
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true
				}
			);

			if (response.status === 201) {
				successMessage = response.data.message;
				errorMessage = '';
				username = '';
				email = '';
				password = '';
				selectedGroups = [];
				accountstatus = 'Active';
				invalidate('loadFetchGroupsUsers');
			}
		} catch (err) {
			if (err.response.status === 403) {
				invalidate('loadAdminCheck');
			} else {
				errorMessage = err.response.data.message;
				successMessage = '';
			}
		}
	};

	// edit user form fields
	let editUsername = '';
	let editEmail = '';
	let editPassword = '';
	let editPreselectedGroups = [];
	let editSelectedGroups = [];
	let editAccountstatus = 'Active';

	const editRow = (user) => {
		editUsername = user.username;
		editEmail = user.email;
		editPreselectedGroups = user.user_group ? user.user_group.split(', ') : [];
		editSelectedGroups = editPreselectedGroups;
		editAccountstatus = user.accountstatus;
	};

	const cancelEdit = () => {
		editUsername = '';
		editEmail = '';
		editPassword = '';
		editPreselectedGroups = [];
		editSelectedGroups = [];
		editAccountstatus = 'Active';
	};

	const editUser = async (e) => {
		e.preventDefault();

		try {
			const response = await axios.put(
				`${USER_URL}/edit`,
				{
					username: editUsername,
					email: editEmail,
					password: editPassword,
					groups: editSelectedGroups,
					accountstatus: editAccountstatus
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true
				}
			);

			if (response.status === 200) {
				successMessage = response.data.message;
				errorMessage = '';
				editUsername = '';
				editEmail = '';
				editPassword = '';
				editPreselectedGroups = [];
				editSelectedGroups = [];
				editAccountstatus = 'Active';
				invalidate('loadFetchGroupsUsers');
				invalidate('loadUserCheck');
			}
		} catch (err) {
			if (err.response.status === 403) {
				invalidate('loadAdminCheck');
			} else {
				errorMessage = err.response.data.message;
				successMessage = '';
			}
		}
	};
</script>

<div style="padding: 20px">
	<!-- Page Title and Welcome Message -->
	<div class="row mb-3">
		<div class="col-12">
			<h1>User Management</h1>
		</div>
	</div>

	<!-- Message Display -->
	{#if errorMessage}
		<div class="row mb-2">
			<div class="col-12">
				<div class="alert alert-danger" role="alert">
					Error: {errorMessage}
				</div>
			</div>
		</div>
	{:else if successMessage}
		<div class="row mb-2">
			<div class="col-12">
				<div class="alert alert-success" role="alert">
					Success: {successMessage}
				</div>
			</div>
		</div>
	{/if}

	<!-- Create Group Table -->
	<div class="row">
		<div class="col-6"></div>
		<div class="col-6">
			<form on:submit={createGroup}>
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
			<form on:submit={createUser}>
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
									type="password"
									class="form-control"
									name="password"
									placeholder="Password*"
									bind:value={password}
								/></th
							>
							<th style="width: 300px">
								<MultiSelect
									class="multi-select-input"
									placeholder="Groups (Optional)"
									--sms-placeholder-color="#6c757d"
									highlightMatches={false}
									bind:value={selectedGroups}
									{options}
								>
									<span slot="expand-icon"></span>
								</MultiSelect>
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
			<form on:submit={editUser}>
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
						{#each usersList as user}
							{#if editUsername && editUsername == user.username}
								<tr>
									<td>
										{user.username}
									</td>
									<td
										><input
											type="text"
											class="form-control"
											name="email"
											placeholder="Email (optional)"
											bind:value={editEmail}
										/></td
									>
									<td
										><input
											type="password"
											class="form-control"
											name="password"
											placeholder="Password"
											bind:value={editPassword}
										/></td
									>
									<td style="width: 300px">
										<MultiSelect
											class="multi-select-input"
											placeholder="Groups (Optional)"
											--sms-placeholder-color="#6c757d"
											highlightMatches={false}
											bind:selected={editPreselectedGroups}
											bind:value={editSelectedGroups}
											{options}
										>
											<span slot="expand-icon"></span>
										</MultiSelect>
									</td>
									<td>
										{#if user.user_group?.includes('admin')}
											{editAccountstatus}
										{:else}
											<select
												class="form-select"
												name="accountstatus"
												readOnly="true"
												bind:value={editAccountstatus}
											>
												<option default value="Active">Active</option>
												<option value="Disabled">Disabled</option>
											</select>
										{/if}
									</td>
									<td
										><button type="submit" class="btn btn-primary">Save</button>
										<button type="button" on:click={() => cancelEdit()} class="btn btn-primary"
											>Cancel</button
										></td
									>
								</tr>
							{:else}
								<tr>
									<td>{user.username}</td>
									<td>{user.email}</td>
									<td>******</td>
									<td>{user.user_group}</td>
									<td>{user.accountstatus}</td>
									<td>
										<button type="button" on:click={() => editRow(user)} class="btn btn-primary">
											Edit
										</button>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</form>
		</div>
	</div>
</div>

<style>
	:global(div.multiselect) {
		min-height: 38px;
		font-weight: normal;
	}

	:global(div.multiselect > *) {
		margin: 0;
		padding: 0;
	}
</style>
