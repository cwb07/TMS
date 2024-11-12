<script>
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  import { enhance } from "$app/forms"
  import { page } from "$app/stores"

  export let form

  // create plan form
  let planname = ""
  let startdate = ""
  let enddate = ""
  let color = ""

  onMount(async () => {
    document.getElementById("createPlanModal").addEventListener("hide.bs.modal", function (event) {
      planname = ""
      startdate = ""
      enddate = ""
      color = ""

      if (form?.errorMessage) {
        form.errorMessage = ""
      }
    })
  })

  $: if (form?.resetCreatePlanForm) {
    bootstrap.Modal.getInstance(document.getElementById("createPlanModal")).hide()
  }

  // load existing app details
  let tasks = [
    {
      taskId: 1,
      planName: "Plan 1",
      taskName: "Sample Task 1",
      taskDescription: "This is a sample task taskDescription",
      taskState: "open",
      taskOwner: "John",
      taskPlanColor: "#33FF57"
    }
  ]

  let appName = ""

  const taskStateHeaders = ["open", "todo", "doing", "done", "closed"]

  onMount(() => {
    if (!sessionStorage.getItem("app")) {
      goto("/task_management")
    } else {
      appName = sessionStorage.getItem("app")
    }
  })

  function getTasksByStatus(taskStateHeader) {
    return tasks.filter(task => task.taskState === taskStateHeader)
  }
</script>

<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 20px">
  {#if $page.data.isPM}
    <button type="submit" class="btn btn-primary" style="margin-left: 20px" data-bs-toggle="modal" data-bs-target="#createPlanModal">Create Plan</button>
  {/if}
  <button type="submit" class="btn btn-primary" style="margin-left: 20px">Create Task</button>
  <div style="flex: 1; text-align: center; margin-right: 300px">
    <h2>{appName}</h2>
  </div>
</div>

<div class="container-fluid mt-4">
  {#if form?.successMessage}
    <div class="row mb-2">
      <div class="col-12">
        <div class="alert alert-success" role="alert">
          Success: {form?.successMessage}
        </div>
      </div>
    </div>
  {/if}
  <div class="row flex-nowrap overflow-auto" style="gap: 0.5rem;">
    {#each taskStateHeaders as taskStateHeader}
      <div class="col" style="min-width: 300px;">
        <div class="card">
          <div class="card-header text-capitalize">
            <h5 class="mb-0">{taskStateHeader}</h5>
          </div>
          <div class="card-body" style="min-height: 500px;">
            {#each getTasksByStatus(taskStateHeader) as task}
              <div class="card mb-3">
                <div class="card-header">
                  <h6 class="mb-0">{task.taskName}</h6>
                </div>
                <div class="card-body">
                  <p class="card-text">{task.taskDescription}</p>
                </div>
                <div class="card-footer">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <span class="badge" style="background-color: {task.taskPlanColor}">
                        {task.planName}
                      </span>
                    </div>
                    <div>
                      <span class="badge bg-secondary">{task.taskOwner}</span>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<!-- Create Plan Modal -->
<div class="modal" id="createPlanModal">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <form
        method="POST"
        action="?/createPlan"
        use:enhance={() => {
          return async ({ update }) => {
            update({ reset: false })
          }
        }}
      >
        <div class="modal-header">
          <h1 class="modal-title fs-5">Create Plan</h1>
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
            <div class="col-md-3" style="text-align: right">Application</div>
            <div class="col-md-9">
              <input type="hidden" name="appname" bind:value={appName} />
              {appName}
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Plan Name*</div>
            <div class="col-md-9">
              <input id="planname" name="planname" class="form-control" bind:value={planname} />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Start Date*</div>
            <div class="col-md-9">
              <input id="startdate" name="startdate" class="form-control" type="date" bind:value={startdate} />
            </div>
          </div>
          <div class="row align-items-center mb-3">
            <div class="col-md-3" style="text-align: right">End Date*</div>
            <div class="col-md-9">
              <input id="enddate" name="enddate" class="form-control" type="date" bind:value={enddate} />
            </div>
          </div>
          <div class="row align-items-center">
            <div class="col-md-3" style="text-align: right">Color*</div>
            <div class="col-md-2">
              <input id="color" name="color" class="form-control" type="color" style="height: 40px;" bind:value={color} />
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
