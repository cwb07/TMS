<script>
  import { page } from "$app/stores"
  import { onMount } from "svelte"
  import axios from "axios"
  import { goto } from "$app/navigation"

  let countdown = 3

  onMount(async () => {
    if ($page.error.redirectToLogin) {
      try {
        await axios.post(`http://localhost:3000/logout`, {}, { headers: { "Content-Type": "application/json" }, withCredentials: true })
      } catch (err) {
        console.log("Logout failed:", err)
      }
    }

    const interval = setInterval(async () => {
      if (countdown > 1) {
        countdown -= 1
      } else {
        clearInterval(interval)
        if ($page.error.redirectToLogin) {
          goto("/login")
        } else if ($page.error.redirectToTMS) {
          goto("/task_management")
        }
      }
    }, 1000)
  })
</script>

<h1>{$page.error.message}</h1>

{#if $page.error.redirectToLogin || $page.error.redirectToTMS}
  <p>Redirecting in {countdown}s...</p>
{/if}
