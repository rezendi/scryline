<script context="module" lang="ts">
	export async function preload( { params }, session ) {

    let response;
    if (params.slug.length > 2 && params.slug[0]=="github") {
      console.log("github", params);
      let githubPath = params.slug.splice(1).join("/");
      response = await this.fetch(`lines/${githubPath}.json`);
    } else {
      let [path, slug] = params.slug;
      response = await this.fetch(`lines/${path}/${slug}.json`);
    }
    const data = await response.json();

		if (response.status === 200 && data.success) {
      return { line : data.line }
		} else {
			this.error(response.status, data.error);
		}
	}
</script>

<script lang="ts">
  import Line from "../../components/Line.svelte";
  export let line: { title:string, sha:string, userid:string, editable:boolean, entries: []};
</script>

<svelte:head>
	<title>{line.title}</title>
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
