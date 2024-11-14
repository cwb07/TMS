<script>
  import { onMount } from "svelte"
  import { enhance } from "$app/forms"
  import { page } from "$app/stores"
  import { formatDateToDisplay } from "$lib/utils.js"

  export let form

  let appName = $page.data.appname || ""
  let defaultColor = "#6C757D"

  // initialization
  onMount(async () => {
    document.getElementById("createPlanModal").addEventListener("show.bs.modal", function (event) {
      planName = ""
      planStartDate = ""
      planEndDate = ""
      planColor = defaultColor

      if (form?.errorMessage) {
        form.errorMessage = ""
      }
    })

    document.getElementById("createTaskModel").addEventListener("show.bs.modal", function (event) {
      taskName = ""
      taskDescription = ""
      taskPlan = ""

      if (form?.errorMessage) {
        form.errorMessage = ""
      }
    })
  })

  // create plan form
  let planName = ""
  let planStartDate = ""
  let planEndDate = ""
  let planColor = defaultColor

  $: if (form?.resetCreatePlanForm) {
    bootstrap.Modal.getInstance(document.getElementById("createPlanModal")).hide()
    form.resetCreatePlanForm = false
  }

  // create task form
  let taskCreationDate = formatDateToDisplay(new Date())
  let taskName = ""
  let taskDescription = ""
  let taskPlan = ""
  let taskPlanStartDate = ""
  let taskPlanEndDate = ""

  $: if (form?.resetCreateTaskForm) {
    bootstrap.Modal.getInstance(document.getElementById("createTaskModel")).hide()
    form.resetCreateTaskForm = false
  }

  // when user selects a plan, display the start and end date of the plan
  $: if (taskPlan) {
    const selectedPlan = $page.data.plansList.find(plan => plan.plan_mvp_name === taskPlan)
    taskPlanStartDate = formatDateToDisplay(selectedPlan.plan_startdate)
    taskPlanEndDate = formatDateToDisplay(selectedPlan.plan_enddate)
  } else {
    taskPlanStartDate = ""
    taskPlanEndDate = ""
  }

  let selectedTaskState = ""
  let selectedTaskCreator = ""
  let selectedTaskCreationDate = ""
  let selectedTaskName = ""
  let selectedTaskOwner = ""
  let selectedTaskDescription = ""
  let selectedTaskNotes = ""
  let selectedTaskId = ""
  let selectedTaskPlan = ""
  let enterLog = ""

  const viewTask = (event, task) => {
    event.preventDefault()

    selectedTaskState = task.task_state
    selectedTaskCreator = task.task_creator
    selectedTaskCreationDate = formatDateToDisplay(task.task_createdate)
    selectedTaskName = task.task_name
    selectedTaskOwner = task.task_owner
    selectedTaskDescription = task.task_description
    selectedTaskNotes = task.task_notes
    selectedTaskId = task.task_id
    selectedTaskPlan = task.task_plan
    enterLog = ""
    taskPlan = task.task_plan

    if (form?.taskSuccessMessage) {
      form.taskSuccessMessage = ""
    }
  }

  $: if (form?.resetSaveTaskForm) {
    selectedTaskNotes = form?.notes
    selectedTaskOwner = $page.data.username
    selectedTaskPlan = form?.plan
    enterLog = ""
    form.resetSaveTaskForm = false

    if (form?.resetPromoteTask2TodoForm) {
      selectedTaskState = "Todo"
      form.resetPromoteTask2TodoForm = false
    }

    if (form?.resetPromoteTask2DoingForm) {
      selectedTaskState = "Doing"
      form.resetPromoteTask2DoingForm = false
    }

    if (form?.resetPromoteTask2DoneForm) {
      selectedTaskState = "Done"
      form.resetPromoteTask2DoneForm = false
    }

    if (form?.resetDemoteTask2DoingForm) {
      selectedTaskState = "Doing"
      form.resetDemoteTask2DoingForm = false
    }

    if (form?.resetPromoteTask2ClosedForm) {
      selectedTaskState = "Closed"
      form.resetPromoteTask2ClosedForm = false
    }
  }
</script>

<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 20px">
  {#if $page.data.isPM}
    <button type="submit" class="btn btn-primary" style="margin-left: 20px" data-bs-toggle="modal" data-bs-target="#createPlanModal">Create Plan</button>
  {/if}
  {#if $page.data.isPL}
    <button type="submit" class="btn btn-primary" style="margin-left: 20px" data-bs-toggle="modal" data-bs-target="#createTaskModel">Create Task</button>
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
    {#each Object.entries($page.data.tasksList) as [state, tasks]}
      <div class="col" style="min-width: 300px;">
        <div class="card">
          <div class="card-header text-capitalize">
            <h5 class="mb-0">{state}</h5>
          </div>
          <div class="card-body" style="min-height: 500px;">
            {#each tasks as task}
              <div class="card mb-3" style="cursor: pointer" data-bs-toggle="modal" data-bs-target="#viewTaskModel">
                <a href="/" on:click={event => viewTask(event, task)} class="stretched-link" aria-label="view-task"></a>
                <div class="card-header">
                  <h6 class="mb-0">{task.task_name}</h6>
                </div>
                <div class="card-body">
                  <p class="card-text">{task.task_description}</p>
                </div>
                <div class="card-footer">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <span class="badge" style="background-color: {task.task_color}">{task.task_plan}</span>
                    </div>
                    <div>
                      <span class="badge bg-secondary">{task.task_owner}</span>
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
<div class="modal" id="createTaskModel">
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
                      {#each $page.data.plansList as plan}
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

<!-- View Task Modal -->
<div class="modal" id="viewTaskModel">
  <div class="modal-dialog modal-dialog-centered modal-xl">
    <div class="modal-content">
      <form
        method="POST"
        use:enhance={() => {
          return async ({ update }) => {
            update({ reset: false })
          }
        }}
      >
        <input type="hidden" name="appname" bind:value={appName} />
        <input type="hidden" name="taskid" bind:value={selectedTaskId} />
        <input type="hidden" name="username" bind:value={$page.data.username} />
        <input type="hidden" name="prevtaskplan" bind:value={selectedTaskPlan} />
        <div class="modal-header">
          <h1 class="modal-title fs-5">Task Details</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          {#if form?.taskSuccessMessage}
            <div class="row mb-2">
              <div class="col-12">
                <div class="alert alert-success" role="alert">
                  Success: {form?.taskSuccessMessage}
                </div>
              </div>
            </div>
          {/if}
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
                    <input type="hidden" name="creator" bind:value={selectedTaskCreator} />
                    {selectedTaskCreator}
                  </div>
                </div>
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Creation Date</div>
                  <div class="col-md-9">
                    <input type="hidden" name="creationdate" bind:value={selectedTaskCreationDate} />
                    {selectedTaskCreationDate}
                  </div>
                </div>
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Status</div>
                  <input type="hidden" name="taskstate" bind:value={selectedTaskState} />
                  <div class="col-md-9 text-capitalize">{selectedTaskState}</div>
                </div>
                <div class="row align-items-center mb-3">
                  <div class="col-md-3" style="text-align: right">Task Name</div>
                  <div class="col-md-9">
                    <input type="hidden" name="taskname" bind:value={selectedTaskName} />
                    {selectedTaskName}
                  </div>
                </div>
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Task Owner</div>
                  <div class="col-md-9">
                    <input type="hidden" name="owner" bind:value={selectedTaskOwner} />
                    {selectedTaskOwner}
                  </div>
                </div>
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Description</div>
                  <div class="col-md-9">
                    <textarea rows="4" disabled id="description" name="description" class="form-control" bind:value={selectedTaskDescription}></textarea>
                  </div>
                </div>
                <div class="row align-items-center mb-2">
                  <div class="col-md-3" style="text-align: right">Plan Name</div>
                  <div class="col-md-9">
                    {#if selectedTaskState === "Open" || selectedTaskState === "Done"}
                      <select class="form-select" name="taskplan" bind:value={taskPlan}>
                        <option></option>
                        {#each $page.data.plansList as plan}
                          <option value={plan.plan_mvp_name}>{plan.plan_mvp_name}</option>
                        {/each}
                      </select>
                    {:else}
                      <input type="hidden" name="taskplan" bind:value={selectedTaskPlan} />
                      {selectedTaskPlan}
                    {/if}
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
                <row>
                  <div class="col-md-12">
                    <h5>Logs</h5>
                  </div>
                </row>
                <row>
                  <div class="col-md-12">
                    <textarea disabled id="description" name="description" class="form-control" style="min-height: {selectedTaskState !== 'Closed' ? '300px' : '370px'};">{selectedTaskNotes}</textarea>
                  </div>
                </row>
                {#if selectedTaskState !== "Closed"}
                  <row>
                    <div class="col-md-12 mt-3">
                      <textarea id="notes" name="notes" class="form-control" placeholder="Enter log" bind:value={enterLog}></textarea>
                    </div>
                  </row>
                {/if}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          {#if selectedTaskState !== "Closed"}
            {#if selectedTaskState === "Open"}
              <button type="submit" class="btn btn-success" formaction="?/promoteTask2Todo" data-bs-dismiss="modal">Release</button>
            {:else if selectedTaskState === "Todo"}
              <button type="submit" class="btn btn-success" formaction="?/promoteTask2Doing" data-bs-dismiss="modal">Assign</button>
            {:else if selectedTaskState === "Doing"}
              <button type="submit" class="btn btn-success" formaction="?/promoteTask2Done" data-bs-dismiss="modal">Review</button>
              <button type="submit" class="btn btn-danger" formaction="?/demoteTask2Todo" data-bs-dismiss="modal">Unassign</button>
            {:else}
              {#if selectedTaskPlan === taskPlan}
                <button type="submit" class="btn btn-success" formaction="?/promoteTask2Closed" data-bs-dismiss="modal">Approve</button>
              {/if}
              <button type="submit" class="btn btn-danger" formaction="?/demoteTask2Doing" data-bs-dismiss="modal">Reject</button>
            {/if}
            {#if selectedTaskPlan === taskPlan}
              <button type="submit" class="btn btn-primary" formaction="?/saveTask">Save</button>
            {/if}
          {/if}
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</div>
