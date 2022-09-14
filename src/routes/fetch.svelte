<script lang="ts">
    import { stores } from '@sapper/app';
	const { session } = stores();
    let durations = ["1 month", "3 months", "6 months", "1 year", "2 years", "5 years", "10 years"];
    let intervals = ["1 day", "1 week", "1 month"];
	async function fetchLine() {
        alert("Fetch goes here");
	}
</script>

<svelte:head>
	<title>Fetch New Scryline</title>
</svelte:head>

<h2>Fetch New Scryline</h2>

<input id="subject" placeholder="Subject to fetch news about" name="subject" size="80">
<hr/>
<b>Duration</b>
{#each durations as duration}
	<label>
		<input type=radio bind:group={durations} name="duration" value={duration}>
		{duration}
	</label>
{/each}
<hr/>
<b>Interval</b>
{#each intervals as interval}
	<label>
		<input type=radio bind:group={intervals} name="interval" value={interval}>
		{interval}
	</label>
{/each}
<hr/>
<button style="float:right;" on:click={fetchLine}>Start Fetch</button>


