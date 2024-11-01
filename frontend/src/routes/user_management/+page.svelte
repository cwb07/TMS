<script>
	import { USER_URL, GROUP_URL } from '$lib/constants';
	import { goto, invalidateAll, invalidate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import axios from 'axios';
	import MultiSelect from 'svelte-multiselect';

	// data from form actions and load
	export let form;
	export let data;
	let errorMessage = '';
	let successMessage = '';

	// load existing groups and users
	$: groupsList = data.groupsList;
	$: usersList = data.usersList;

	// group form fields
	let groupname = '';

	// user form fields
	let username = '';
	let email = '';
	let password = '';
	let accountstatus = 'Active';
	let selectedGroups = [];
	$: options = groupsList || [];

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
				groupname = '';
				invalidate('loadUserManagement');
			}
		} catch (error) {
			errorMessage = error.response.data.message;
			successMessage = '';
		}
	};

	const createUser = async (e) => {
		e.preventDefault();
	};

	// select groups logic for create user
	let isDropdownOpen = false;

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
		isEditDropdownOpen = false;
	}

	function selectGroup(group) {
		if (!selectedGroups.includes(group)) {
			selectedGroups = [...selectedGroups, group];
		}
	}

	function removeGroup(groupToRemove) {
		selectedGroups = selectedGroups.filter((group) => group !== groupToRemove);
	}

	// edit user form fields
	$: currentlyEditing = null;
	$: editingUsername = '' || form?.editFormData?.username;
	$: editingEmail = '' || form?.editFormData?.email;
	$: editingPassword = '' || form?.editFormData?.password;
	$: editingAccountStatus = '' || form?.editFormData?.accountstatus;
	$: editingSelectedGroups =
		form?.editFormData?.groups.length > 0 ? form?.editFormData?.groups : [];

	function editRow(user) {
		currentlyEditing = true;
		editingUsername = user.username;
		editingEmail = user.email;
		editingPassword = '';
		editingSelectedGroups = user.user_group ? user.user_group.split(', ') : [];
		editingAccountStatus = user.accountstatus;
	}

	function cancelEdit() {
		currentlyEditing = false;
		editingUsername = '';
		editingEmail = '';
		editingPassword = '';
		editingSelectedGroups = [];
		editingAccountStatus = '';
	}

	// select groups logic for editing user
	let isEditDropdownOpen = false;

	function toggleEditDropdown() {
		isEditDropdownOpen = !isEditDropdownOpen;
		isDropdownOpen = false;
	}

	function selectEditGroup(group) {
		if (!editingSelectedGroups.includes(group)) {
			editingSelectedGroups = [...editingSelectedGroups, group];
		}
	}

	function removeEditGroup(groupToRemove) {
		editingSelectedGroups = editingSelectedGroups.filter((group) => group !== groupToRemove);
	}

	// close dropdown when clicking outside
	function handleClickOutside(event) {
		const multiSelect = event.target.closest('.multi-select-container');
		if (!multiSelect) {
			// close all dropdowns
			isDropdownOpen = false;
			isEditDropdownOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

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
	{/if}
	{#if successMessage}
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
									bind:selectedGroups
									--sms-placeholder-color="#6c757d"
									highlightMatches={false}
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
			<form method="POST" action="?/editUser" use:enhance>
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
							{#if editingUsername != user.username}
								<tr>
									<td>{user.username}</td>
									<td>{user.email}</td>
									<td>******</td>
									<td>{user.user_group}</td>
									<td>{user.accountstatus}</td>
									<td>
										<button
											disabled={currentlyEditing && form?.editSucess}
											type="button"
											on:click={() => editRow(user)}
											class="btn btn-primary"
										>
											Edit
										</button>
									</td>
								</tr>
							{:else}
								<tr>
									<td>
										<input type="hidden" name="username" value={user.username} />
										{user.username}
									</td>
									<td
										><input
											type="text"
											class="form-control"
											name="email"
											placeholder="Email (optional)"
											bind:value={editingEmail}
										/></td
									>
									<td
										><input
											type="password"
											class="form-control"
											name="password"
											placeholder="Password"
											bind:value={editingPassword}
										/></td
									>
									<td>
										<input type="hidden" name="selectedGroups" bind:value={editingSelectedGroups} />
										<div class="multi-select-container">
											<button
												type="button"
												class="form-control multi-select-field"
												on:click={toggleEditDropdown}
												on:keydown={(e) => e.key === 'Enter' && toggleEditDropdown()}
												aria-haspopup="listbox"
											>
												{#if editingSelectedGroups.length === 0}
													<span class="text-muted">Select groups (Optional)</span>
												{:else}
													{#each editingSelectedGroups as group}
														<div class="selected-item">
															{group}
															<span
																class="remove-item"
																on:click|stopPropagation={() => removeEditGroup(group)}
																on:keydown={(e) => e.key === 'Enter' && removeEditGroup(group)}
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
											<div class="dropdown-menu {isEditDropdownOpen ? 'show' : ''}">
												{#each groupsList as group}
													<button
														type="button"
														class="dropdown-item"
														on:click={() => selectEditGroup(group)}
														on:keydown={(e) => e.key === 'Enter' && selectEditGroup(group)}
														role="menuitem"
													>
														{group}
													</button>
												{/each}
											</div>
										</div>
									</td>
									<td
										><select
											class="form-select"
											name="accountstatus"
											bind:value={editingAccountStatus}
										>
											<option default value="Active">Active</option>
											<option value="Disabled">Disabled</option>
										</select></td
									>
									<td
										><button type="submit" class="btn btn-primary">Save</button>
										<button type="button" on:click={() => cancelEdit()} class="btn btn-primary"
											>Cancel</button
										></td
									>
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
