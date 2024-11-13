<script>
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  import { enhance } from "$app/forms"
  import { page } from "$app/stores"
  import axios from "axios"
  import { formatDateToDisplay } from "$lib/utils.js"

  export let form

  // initialization
  onMount(async () => {
    document.getElementById("createPlanModal").addEventListener("hide.bs.modal", function (event) {
      planName = ""
      planStartDate = ""
      planEndDate = ""
      planColor = "#FFFFFF"

      if (form?.errorMessage) {
        form.errorMessage = ""
      }
    })

    document.getElementById("createTaskModal").addEventListener("hide.bs.modal", function (event) {
      taskName = ""
      taskDescription = ""
      taskPlan = ""

      if (form?.errorMessage) {
        form.errorMessage = ""
      }
    })
  })

  let appName = ""
  const taskStateHeaders = ["open", "todo", "doing", "done", "closed"]

  onMount(() => {
    if (!sessionStorage.getItem("app")) {
      goto("/task_management")
    } else {
      appName = sessionStorage.getItem("app")
    }
  })

  const getTasksByStatus = taskStateHeader => {
    return tasks.filter(task => task.taskState === taskStateHeader)
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

  // create plan form
  let planName = ""
  let planStartDate = ""
  let planEndDate = ""
  let planColor = "#FFFFFF"

  $: if (form?.resetCreatePlanForm) {
    bootstrap.Modal.getInstance(document.getElementById("createPlanModal")).hide()
  }

  // create task form
  let taskCreationDate = formatDateToDisplay(new Date())
  let taskName = ""
  let taskDescription = ""
  let taskPlan = ""
  let taskPlanStartDate = ""
  let taskPlanEndDate = ""

  $: if (form?.resetCreateTaskForm) {
    bootstrap.Modal.getInstance(document.getElementById("createTaskModal")).hide()
  }

  // when user selects a plan, display the start and end date of the plan
  $: if (taskPlan) {
    const selectedPlan = listOfPlans.find(plan => plan.plan_mvp_name === taskPlan)
    taskPlanStartDate = formatDateToDisplay(selectedPlan.plan_startdate)
    taskPlanEndDate = formatDateToDisplay(selectedPlan.plan_enddate)
  } else {
    taskPlanStartDate = ""
    taskPlanEndDate = ""
  }

  let listOfPlans = []

  const handleCreateTask = async () => {
    // load available plans on click of create task
    try {
      const response = await axios.post(
        `http://localhost:3000/getAllPlansInApp`,
        { plan_app_acronym: appName },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      )

      if (response.data.success) {
        listOfPlans = response.data.data
      }
    } catch (err) {
      location.reload()
    }
  }
</script>

<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 20px">
  {#if $page.data.isPM}
    <button type="submit" class="btn btn-primary" style="margin-left: 20px" data-bs-toggle="modal" data-bs-target="#createPlanModal">Create Plan</button>
  {/if}
  {#if $page.data.isPL}
    <button type="submit" class="btn btn-primary" style="margin-left: 20px" data-bs-toggle="modal" data-bs-target="#createTaskModal" on:click={handleCreateTask}>Create Task</button>
  {/if}
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
                      <span class="badge">
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
              <input id="planname" name="planname" class="form-control" bind:value={planName} />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Start Date*</div>
            <div class="col-md-9">
              <input id="startdate" name="startdate" class="form-control" type="date" bind:value={planStartDate} />
            </div>
          </div>
          <div class="row align-items-center mb-3">
            <div class="col-md-3" style="text-align: right">End Date*</div>
            <div class="col-md-9">
              <input id="enddate" name="enddate" class="form-control" type="date" bind:value={planEndDate} />
            </div>
          </div>
          <div class="row align-items-center">
            <div class="col-md-3" style="text-align: right">Color*</div>
            <div class="col-md-2">
              <input id="color" name="color" class="form-control" type="color" style="height: 40px;" bind:value={planColor} />
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

<!-- Create Task Modal -->
<div class="modal" id="createTaskModal">
  <div class="modal-dialog modal-dialog-centered modal-xl">
    <div class="modal-content">
      <form
        method="POST"
        action="?/createTask"
        use:enhance={() => {
          return async ({ update }) => {
            update({ reset: false })
          }
        }}
      >
        <input type="hidden" name="appname" bind:value={appName} />
        <div class="modal-header">
          <h1 class="modal-title fs-5">Task Details</h1>
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
          <div class="container-fluid">
            <div class="row">
              <div class="col-md-6">
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Creator</div>
                  <div class="col-md-9">
                    <input type="hidden" name="creator" bind:value={$page.data.username} />
                    {$page.data.username}
                  </div>
                </div>
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Creation Date</div>
                  <div class="col-md-9">
                    <input type="hidden" name="creationdate" bind:value={taskCreationDate} />
                    {taskCreationDate}
                  </div>
                </div>
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Status</div>
                  <div class="col-md-9">Open</div>
                </div>
                <div class="row align-items-center mb-3">
                  <div class="col-md-3" style="text-align: right">Task Name*</div>
                  <div class="col-md-9">
                    <input id="taskname" name="taskname" class="form-control" bind:value={taskName} />
                  </div>
                </div>
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Task Owner</div>
                  <div class="col-md-9">
                    <input type="hidden" name="owner" bind:value={$page.data.username} />
                    {$page.data.username}
                  </div>
                </div>
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Description</div>
                  <div class="col-md-9">
                    <textarea rows="4" id="description" name="description" class="form-control" bind:value={taskDescription}></textarea>
                  </div>
                </div>
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Plan Name</div>
                  <div class="col-md-9">
                    <select class="form-select" name="taskplan" bind:value={taskPlan}>
                      <option></option>
                      {#each listOfPlans as plan}
                        <option value={plan.plan_mvp_name}>{plan.plan_mvp_name}</option>
                      {/each}
                    </select>
                  </div>
                </div>
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Plan Start Date</div>
                  <div class="col-md-9">
                    {taskPlanStartDate}
                  </div>
                </div>
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Plan End Date</div>
                  <div class="col-md-9">
                    {taskPlanEndDate}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <h5>Logs</h5>
                <textarea disabled id="description" name="description" class="form-control" style="min-height: 370px;"></textarea>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-success">Create</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</div>
