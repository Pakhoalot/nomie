<!-- template -->
{#if $UserStore.signedIn === true}
{:else if $UserStore.signedIn == undefined}
{/if}

<!-- template -->

<script>
import { UserStore } from "./store/user"; 
</script>