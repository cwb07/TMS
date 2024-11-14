<script>
  import { enhance } from "$app/forms"
  import { page } from "$app/stores"

  export let form

  let email = ""
  let password = ""

  $: if (form?.resetUpdateProfileForm) {
    email = ""
    password = ""
    form.resetUpdateProfileForm = false
  }
</script>

<div class="container">
  <div class="row justify-content-center align-items-center" style="margin-top: 200px">
    <div class="col-md-6 col-lg-4">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title text-center mb-4">Update Info</h3>
          <!-- Message Display -->
          {#if form?.errorMessage}
            <div class="row mb-2">
              <div class="col-12">
                <div class="alert alert-danger" role="alert">
                  Error: {form?.errorMessage}
                </div>
              </div>
            </div>
          {:else if form?.successMessage}
            <div class="row mb-2">
              <div class="col-12">
                <div class="alert alert-success" role="alert">
                  Success: {form?.successMessage}
                </div>
              </div>
            </div>
          {/if}
          <div class="mb-3">
            <label for="email" class="form-label">Current Email Address</label>
            {#if $page.data.email}
              <p id="email"><b>{$page.data.email}</b></p>
            {:else}
              <p id="email"><b>No email</b></p>
            {/if}
          </div>
          <form
            method="POST"
            use:enhance={() => {
              return async ({ update }) => {
                update({ reset: false })
              }
            }}
          >
            <input type="hidden" name="username" value={$page.data.username} />
            <div class="mb-3">
              <label for="email" class="form-label">New Email</label>
              <input id="email" name="email" class="form-control" bind:value={email} />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">New Password</label>
              <input id="password" type="password" name="password" class="form-control" bind:value={password} />
            </div>
            <button type="submit" class="btn btn-primary w-100">Update</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
