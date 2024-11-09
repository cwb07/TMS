<script>
  import MultiSelect from "svelte-multiselect";
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import NavBar from "$lib/components/NavBar.svelte";

  export let form;

  $: errorMessage = "" || form?.errorMessage;
  $: successMessage = "" || form?.successMessage;

  // load existing groups
  $: options = $page.data.groupsList || [];

  // group form fields
  let groupname = "";

  $: if (form?.resetCreateGroupForm) {
    groupname = "";

    // 0.1s delay to wait for groupname updates
    setTimeout(() => {
      document.getElementById("groupname").focus();
    }, 100);
  }

  // user form fields
  let username = "";
  let email = "";
  let password = "";
  let selectedGroups = [];
  let accountstatus = "Active";

  $: if (form?.resetCreateUserForm) {
    username = "";
    email = "";
    password = "";
    selectedGroups = [];
    accountstatus = "Active";
    document.getElementById("username").focus();
  }

  // edit user form fields
  let editUsername = "";
  let editEmail = "";
  let editPassword = "";
  let editSelectedGroups = [];
  let editAccountstatus = "Active";

  const editRow = (user) => {
    // load user data to edit form
    editUsername = user.username;
    editEmail = user.email;
    editSelectedGroups = user.user_group ? user.user_group.split(", ") : [];

    if (user.username === "admin") {
      //remove admin from edit selected groups
      editSelectedGroups = editSelectedGroups.filter(
        (group) => group !== "admin"
      );
      options = options.filter((group) => group !== "admin");
    } else {
      // insert admin back to options list
      // ensure only 1 admin group is available
      if (!options.includes("admin")) {
        options = [...options, "admin"];
      }
    }
    editAccountstatus = user.accountstatus;
  };

  $: if (form?.resetEditUserForm) {
    cancelEdit();
  }

  const cancelEdit = () => {
    editUsername = "";
    editEmail = "";
    editPassword = "";
    editSelectedGroups = [];
    editAccountstatus = "Active";
  };

  onMount(() => {
    if (!$page.data.isAdmin) {
      goto("/task_management");
    }
  });
</script>

<NavBar />

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
    <div class="col-8"></div>
    <div class="col-4">
      <form
        method="POST"
        action="?/createGroup"
        use:enhance={() => {
          return async ({ update }) => {
            update({ reset: false });
          };
        }}
      >
        <table class="table table-bordered text-center">
          <tbody>
            <tr>
              <th class="col-3">
                <input
                  id="groupname"
                  type="text"
                  class="form-control"
                  placeholder="Group Name"
                  name="groupname"
                  maxlength="50"
                  bind:value={groupname}
                />
              </th>
              <th class="col-1"
                ><button type="submit" class="btn btn-primary w-100"
                  >Create Group</button
                >
              </th>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  </div>

  <!-- Create User Table -->
  <div class="row">
    <div class="col-12">
      <form
        method="POST"
        action="?/createUser"
        use:enhance={() => {
          return async ({ update }) => {
            update({ reset: false });
          };
        }}
      >
        <table class="table table-bordered text-center">
          <tbody>
            <tr>
              <th class="col-2">
                <input
                  id="username"
                  type="text"
                  class="form-control"
                  name="username"
                  placeholder="Username*"
                  maxlength="50"
                  bind:value={username}
                />
              </th>
              <th class="col-2">
                <input
                  type="text"
                  class="form-control"
                  name="email"
                  placeholder="Email (optional)"
                  bind:value={email}
                />
              </th>
              <th class="col-2">
                <input
                  type="password"
                  class="form-control"
                  name="password"
                  placeholder="Password*"
                  maxlength="10"
                  bind:value={password}
                />
              </th>
              <th class="col-2">
                <MultiSelect
                  class="multi-select-input"
                  placeholder="Groups (Optional)"
                  --sms-placeholder-color="#6c757d"
                  --sms-options-max-height="40vh"
                  highlightMatches={false}
                  name="groups"
                  bind:value={selectedGroups}
                  {options}
                >
                  <span slot="expand-icon"></span>
                </MultiSelect>
              </th>
              <th class="col-1">
                <select
                  class="form-select"
                  name="accountstatus"
                  bind:value={accountstatus}
                >
                  <option default value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </th>
              <th class="col-1">
                <button type="submit" class="btn btn-primary w-100"
                  >Create User</button
                >
              </th>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  </div>

  <!-- Edit User Table -->
  <div class="row">
    <div class="col-12">
      <form
        method="POST"
        action="?/editUser"
        use:enhance={() => {
          return async ({ update }) => {
            update({ reset: false });
          };
        }}
      >
        <table
          class="table text-center table-bordered table-sm"
          class:table-hover={!editUsername}
        >
          <thead class="table-light">
            <tr>
              <th class="col-2">Username</th>
              <th class="col-2">Email</th>
              <th class="col-2">Password</th>
              <th class="col-2">Group</th>
              <th class="col-1">Active</th>
              <th class="col-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {#each $page.data.usersList as user}
              {#if editUsername && editUsername == user.username}
                <tr class="table-primary">
                  <td>
                    <input
                      type="hidden"
                      name="username"
                      value={user.username}
                    />
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
                      maxlength="10"
                      bind:value={editPassword}
                    /></td
                  >
                  <td style="width: 300px">
                    <MultiSelect
                      class="multi-select-input"
                      placeholder="Groups (Optional)"
                      --sms-placeholder-color="#6c757d"
                      --sms-options-max-height="40vh"
                      highlightMatches={false}
                      name="groups"
                      bind:selected={editSelectedGroups}
                      {options}
                    >
                      <span slot="expand-icon"></span>
                    </MultiSelect>
                  </td>
                  <td>
                    {#if editUsername === "admin"}
                      <input
                        type="hidden"
                        name="accountstatus"
                        value={editAccountstatus}
                      />
                      {editAccountstatus}
                    {:else}
                      <select
                        class="form-select"
                        name="accountstatus"
                        bind:value={editAccountstatus}
                      >
                        <option default value="Active">Active</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                    {/if}
                  </td>
                  <td
                    ><button type="submit" class="btn btn-success">Save</button>
                    <button
                      type="button"
                      on:click={() => cancelEdit()}
                      class="btn btn-danger"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              {:else}
                <tr>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>******</td>
                  <td>{user.user_group}</td>
                  <td>{user.accountstatus}</td>
                  <td>
                    <button
                      type="button"
                      on:click={() => editRow(user)}
                      class="btn btn-primary"
                    >
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
    background-color: #fff;
  }

  :global(div.multiselect > *) {
    margin: 0;
    padding: 0;
  }
</style>
