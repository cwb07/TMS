<script>
  import { page } from "$app/stores"

  $: console.log($page.data)
</script>

<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 20px">
  <div style="flex: 1; text-align: center;">
    <h2 style="margin-left: 100px">APPLICATIONS</h2>
  </div>
  <button type="submit" class="btn btn-primary" style="margin-right: 20px;" data-bs-toggle="modal" data-bs-target="#createAppModal">Create App</button>
</div>

<div class="row row-cols-1 row-cols-md-3 g-4" style="padding: 20px">
  {#each $page.data.applicationsList as application}
    <div class="col">
      <div class="card" style="position: relative">
        <i class="bi bi-pencil-square" style="position: absolute; right: 1rem; top: 0.5rem; font-size: 2rem; cursor: pointer"></i>
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
            <div class="col-md-7">{application.app_startdate}</div>
          </div>
          <div class="row">
            <div class="col-md-4" style="text-align: right"><b>END DATE</b></div>
            <div class="col-md-7">{application.app_enddate}</div>
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>

<!-- Create App Modal -->
<div class="modal" id="createAppModal">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5">Create App</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Name</div>
            <div class="col-md-9">
              <input id="name" name="name" class="form-control" />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">RNumber</div>
            <div class="col-md-9">
              <input id="rnumber" name="rnumber" class="form-control" />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Description</div>
            <div class="col-md-9">
              <input id="description" name="description" class="form-control" />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Start Date</div>
            <div class="col-md-9">
              <input id="startdate" name="startdate" class="form-control" type="date" />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">End Date</div>
            <div class="col-md-9">
              <input id="enddate" name="enddate" class="form-control" type="date" />
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Open</div>
            <div class="col-md-9">
              <select class="form-select" name="permitopen">
                <option hidden selected></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Todo</div>
            <div class="col-md-9">
              <select class="form-select" name="permittodo">
                <option hidden selected></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Doing</div>
            <div class="col-md-9">
              <select class="form-select" name="permitdoing">
                <option hidden selected></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Create</div>
            <div class="col-md-9">
              <select class="form-select" name="permitcreate">
                <option hidden selected></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="row align-items-center mb-2">
            <div class="col-md-3" style="text-align: right">Permit Done</div>
            <div class="col-md-9">
              <select class="form-select" name="permitdone">
                <option hidden selected></option>
                {#each $page.data.groupsList as group}
                  <option>{group}</option>
                {/each}
              </select>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary col">Create</button>
      </div>
    </div>
  </div>
</div>
