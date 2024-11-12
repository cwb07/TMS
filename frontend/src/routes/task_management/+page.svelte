<script>
  import { page } from "$app/stores"
  import { enhance } from "$app/forms"
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"

  const handleRedirectToView = application => {
    sessionStorage.setItem("app", application.app_acronym)
    goto(`/task_management/kanban`)
  }

  export let form

  // create app form
  let name = ""
  let rnumber = ""
  let description = ""
  let startdate = ""
  let enddate = ""
  let permitopen = ""
  let permittodo = ""
  let permitdoing = ""
  let permitdone = ""
  let permitcreate = ""

  onMount(async () => {
    document.getElementById("createAppModal").addEventListener("hide.bs.modal", function (event) {
      name = ""
      rnumber = ""
      description = ""
      startdate = ""
      enddate = ""
      permitopen = ""
      permittodo = ""
      permitdoing = ""
      permitdone = ""
      permitcreate = ""

      if (form?.errorMessage) {
        form.errorMessage = ""
      }
    })

    document.getElementById("editAppModal").addEventListener("hide.bs.modal", function (event) {
      editName = ""
      editRnumber = ""
      editDescription = ""
      editStartdate = ""
      editEnddate = ""
      editPermitopen = ""
      editPermittodo = ""
      editPermitdoing = ""
      editPermitdone = ""
      editPermitcreate = ""

      if (form?.errorMessage) {
        form.errorMessage = ""
      }
    })
  })

  $: if (form?.resetCreateAppForm) {
    bootstrap.Modal.getInstance(document.getElementById("createAppModal")).hide()
  }

  // edit app form
  let prevEditName = ""
  let editName = ""
  let editRnumber = ""
  let editDescription = ""
  let editStartdate = ""
  let editEnddate = ""
  let editPermitopen = ""
  let editPermittodo = ""
  let editPermitdoing = ""
  let editPermitdone = ""
  let editPermitcreate = ""

  const editApp = application => {
    // load application details to edit form
    prevEditName = application.app_acronym
    editName = application.app_acronym
    editRnumber = application.app_rnumber
    editDescription = application.app_description

    // convert app_startdate date to yyyy-MM-dd format
    editStartdate = new Date(application.app_startdate).toLocaleDateString("en-ca")
    editEnddate = new Date(application.app_enddate).toLocaleDateString("en-ca")

    editPermitopen = application.app_permit_open
    editPermittodo = application.app_permit_todolist
    editPermitdoing = application.app_permit_doing
    editPermitdone = application.app_permit_done
    editPermitcreate = application.app_permit_create
  }

  $: if (form?.resetEditAppForm) {
    bootstrap.Modal.getInstance(document.getElementById("editAppModal")).hide()
  }
</script>

<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 20px">
  <div style="flex: 1; text-align: center;">
    <h2>APPLICATIONS</h2>
  </div>
  {#if $page.data.isPL}
    <button type="submit" class="btn btn-primary" style="margin-right: 20px;" data-bs-toggle="modal" data-bs-target="#createAppModal">Create App</button>
  {/if}
</div>

<div class="container-fluid" style="margin-top: 10px; margin-bottom: 10px">
  {#if form?.successMessage}
    <div class="row mb-2">
      <div class="col-12">
        <div class="alert alert-success" role="alert">
          Success: {form?.successMessage}
        </div>
      </div>
    </div>
  {/if}

  <div class="row row-cols-1 row-cols-md-3 g-4">
    {#each $page.data.applicationsList as application}
      <div class="col">
        <div class="card h-100" style="position: relative">
          {#if $page.data.isPL}
            <button on:click={() => editApp(application)} class="bi bi-pencil-square btn btn-sm edit-btn" type="submit" aria-label="edit-btn" data-bs-toggle="modal" data-bs-target="#editAppModal"></button>
          {/if}
          <div class="card-body">
            <div class="row">
              <div class="col-md-4" style="text-align: right"><b>APP NAME</b></div>
              <div class="col-md-7">{application.app_acronym}</div>
            </div>
            <div class="row">
              <div class="col-md-4" style="text-align: right"><b>DESCRIPTION</b></div>
              <div class="col-md-7">{application.app_description}</div>
            </div>
            <div class="row">
              <div class="col-md-4" style="text-align: right"><b>START DATE</b></div>
              <div class="col-md-7">
                {new Date(application.app_startdate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })}
              </div>
            </div>
            <div class="row">
              <div class="col-md-4" style="text-align: right"><b>END DATE</b></div>
              <div class="col-md-7">
                {new Date(application.app_enddate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })}
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button type="submit" class="btn btn-primary btn-sm w-100" on:click={() => handleRedirectToView(application)}>View</button>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<!-- Edit App Modal -->
<div class="modal" id="editAppModal">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <form
        method="POST"
        action="?/editApp"
        use:enhance={() => {
          return async ({ update }) => {
            update({ reset: false })
          }
        }}
      >
        <div class="modal-header">
          <h1 class="modal-title fs-5">Edit App</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          {#if form?.errorMessage}
            <div class="row mb-2">
              <div class="col-12">
                <div class="alert alert-danger" role="alert">
                  Error: {form?.errorMessage}
                </div>
              </div>
            </div>
          {/if}
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Name*</div>
            <div class="col-md-9">
              <input type="hidden" name="prevname" value={prevEditName} />
              <input id="name" name="name" class="form-control" bind:value={editName} />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">RNumber*</div>
            <div class="col-md-9">
              <input type="hidden" name="rnumber" value={editRnumber} />
              {editRnumber}
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Description</div>
            <div class="col-md-9">
              <textarea rows="4" id="description" name="description" class="form-control" bind:value={editDescription}></textarea>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Start Date*</div>
            <div class="col-md-9">
              <input id="startdate" name="startdate" class="form-control" type="date" bind:value={editStartdate} />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">End Date*</div>
            <div class="col-md-9">
              <input id="enddate" name="enddate" class="form-control" type="date" bind:value={editEnddate} />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Open</div>
            <div class="col-md-9">
              <select class="form-select" name="permitopen" bind:value={editPermitopen}>
                <option></option>
                {#each $page.data.groupsList as group}
                  <option value={group}>{group}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Todo</div>
            <div class="col-md-9">
              <select class="form-select" name="permittodo" bind:value={editPermittodo}>
                <option></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Doing</div>
            <div class="col-md-9">
              <select class="form-select" name="permitdoing" bind:value={editPermitdoing}>
                <option></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Done</div>
            <div class="col-md-9">
              <select class="form-select" name="permitdone" bind:value={editPermitdone}>
                <option></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Create</div>
            <div class="col-md-9">
              <select class="form-select" name="permitcreate" bind:value={editPermitcreate}>
                <option></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary col">Update</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Create App Modal -->
<div class="modal" id="createAppModal">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <form
        method="POST"
        action="?/createApp"
        use:enhance={() => {
          return async ({ update }) => {
            update({ reset: false })
          }
        }}
      >
        <div class="modal-header">
          <h1 class="modal-title fs-5">Create App</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          {#if form?.errorMessage}
            <div class="row mb-2">
              <div class="col-12">
                <div class="alert alert-danger" role="alert">
                  Error: {form?.errorMessage}
                </div>
              </div>
            </div>
          {/if}
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Name*</div>
            <div class="col-md-9">
              <input id="name" name="name" class="form-control" bind:value={name} />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">RNumber*</div>
            <div class="col-md-9">
              <input id="rnumber" name="rnumber" class="form-control" type="number" bind:value={rnumber} />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Description</div>
            <div class="col-md-9">
              <textarea rows="4" id="description" name="description" class="form-control" bind:value={description}></textarea>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Start Date*</div>
            <div class="col-md-9">
              <input id="startdate" name="startdate" class="form-control" type="date" bind:value={startdate} />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">End Date*</div>
            <div class="col-md-9">
              <input id="enddate" name="enddate" class="form-control" type="date" bind:value={enddate} />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Open</div>
            <div class="col-md-9">
              <select class="form-select" name="permitopen" bind:value={permitopen}>
                <option></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Todo</div>
            <div class="col-md-9">
              <select class="form-select" name="permittodo" bind:value={permittodo}>
                <option></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Doing</div>
            <div class="col-md-9">
              <select class="form-select" name="permitdoing" bind:value={permitdoing}>
                <option></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Done</div>
            <div class="col-md-9">
              <select class="form-select" name="permitdone" bind:value={permitdone}>
                <option></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Create</div>
            <div class="col-md-9">
              <select class="form-select" name="permitcreate" bind:value={permitcreate}>
                <option></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary col">Create</button>
        </div>
      </form>
    </div>
  </div>
</div>

<style>
  .edit-btn {
    position: absolute;
    right: 1rem;
    top: 0.5rem;
    font-size: 2rem;
  }

  .edit-btn:hover {
    color: #007bff;
  }

  /* Hide number input arrows */
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>
