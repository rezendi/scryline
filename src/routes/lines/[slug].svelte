<script context="module" lang="ts">
	export async function preload({ params }) {
    // the `slug` parameter is available because this file is called [slug].svelte
    // console.log("slug", params.slug);
		const res = await this.fetch(`lines/${params.slug}.json`);
    const data = await res.json();

		if (res.status === 200) {
      return { line : data }
		} else {
			this.error(res.status, data.message);
		}
	}
</script>

<script lang="ts">
  import Line from "../../components/Line.svelte";
  export let line: { id:number, slug:string, title:string, sha:string, entries: []};
</script>

<svelte:head>
	<title>{line.title || "New Line"}</title>
</svelte:head>

<style>
  .page{
    max-width: 47rem;
    padding: 1rem 2rem 3rem;
    margin-left: auto;
    margin-right: auto;
  }
</style>  
  
<div class="page">
  <Line {line}/>
</div>
