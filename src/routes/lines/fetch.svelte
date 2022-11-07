<script lang="ts">
    import { stores } from '@sapper/app';
	const { session } = stores();
    let title = '', search = '', duration = "1 year", interval = "1 week";
    let durations = ["1 month", "3 months", "6 months", "1 year", "2 years", "5 years", "10 years"];
    let intervals = ["1 day", "1 week", "1 month"];

    async function fetchLine() {
		console.log("Starting fetch");
		let response = await fetch('/lines/fetch.json', {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({title,search,duration,interval})
		});
		let json = await response.json();
		if (json.success) {
			console.log("success");
		}
    }
</script>

<svelte:head>
	<title>Fetch New Scryline</title>
</svelte:head>

<h2>Fetch New Scryline</h2>

<input id="title" placeholder="Title of new timeline" name="title" size="80" bind:value={title}>
<input id="search" placeholder="Search string to use" name="search" size="80" bind:value={search}>
<hr/>
<b>Duration</b>
{#each durations as durationOption}
	<label>
		<input type=radio name="duration" value={durationOption} bind:group={duration} >
		{durationOption}
	</label>
{/each}
<hr/>
<b>Interval</b>
{#each intervals as intervalOption}
	<label>
		<input type=radio name="interval" value={intervalOption} bind:group={interval}>
		{intervalOption}
	</label>
{/each}
<hr/>
<button style="float:right;" on:click={fetchLine}>Start Fetch</button>
