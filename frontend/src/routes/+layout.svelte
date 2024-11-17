<script>
  import { goto } from "$app/navigation";
  import axios from "axios";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  const logout = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`http://localhost:3000/logout`, {}, { headers: { "Content-Type": "application/json" }, withCredentials: true,});

      if (response.data.success) {
        goto("/login");
      }
    } catch (err) {
      goto("/login");
    }
  };

  onMount(() => {
    if ($page.url.pathname === "/") {
      goto("/login");
    }
  });

  $: if ($page.error) {
    if (typeof window !== "undefined") {
      // list modal class elements
      let modals = document?.getElementsByClassName("modal-backdrop");

      for (let modal of modals) {
        // remove modal class elements
        modal.remove();
      }
    }
  }
</script>

{#if $page.url.pathname !== "/login" && !$page.error}
  <nav class="navbar navbar-expand-lg py-3" style="background-color: #99cdf4; margin-bottom: 10px">
    <div class="container-fluid">
      <span class="navbar-brand" id="userId" style="flex-grow: 1; text-align: left;">
        <b>Welcome, {$page.data.username}</b>
      </span>

      {#if $page.data.isAdmin}
        <a class="navbar-brand mx-auto" href="/user_management" class:underline={$page.url.pathname.includes("/user_management")}><b>USER MANAGEMENT SYSTEM</b></a>
        &nbsp;|&nbsp;
      {/if}
      <a class="navbar-brand mx-auto" href="/task_management" class:underline={$page.url.pathname.includes("/task_management")}><b>TASK MANAGEMENT SYSTEM</b></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link border border-dark rounded px-2 py-1" href="/profile" style="margin-right: 10px;">Edit Profile</a>
          </li>
          <li class="nav-item">
            <a href="/logout" class="nav-link border border-dark rounded px-2 py-1" on:click={logout}>Logout</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
{/if}

{#if $page.url.pathname !== "/"}
  <slot />
{/if}

<style>
  .underline {
    text-decoration: underline;
  }
</style>
