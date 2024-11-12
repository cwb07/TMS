<script>
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"

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
  <button type="submit" class="btn btn-primary" style="margin-left: 20px">Create Plan</button>
  <button type="submit" class="btn btn-primary" style="margin-left: 20px">Create Task</button>
  <div style="flex: 1; text-align: center; margin-right: 300px">
    <h2>{appName}</h2>
  </div>
</div>

<div class="container-fluid mt-4">
  <div class="row flex-nowrap overflow-auto" style="gap: 0.5rem;">
    {#each taskStateHeaders as taskStateHeader}
      <div class="col" style="min-width: 300px;">
        <div class="card">
          <div class="card-header bg-light text-capitalize">
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
                      <span class="badge me-1" style="background-color: {task.taskPlanColor}">
                        {task.planName}
                      </span>
                    </div>
                    <div>
                      <span class="badge bg-secondary me-1">{task.taskOwner}</span>
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
