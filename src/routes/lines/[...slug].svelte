<script context="module" lang="ts">
	export async function preload( { query, params }, session ) {

    let response, path, slug;
    if (params.slug.length > 2 && params.slug[0]=="github") {
      path = params.slug.splice(1).join("/");
      response = await this.fetch(`lines/${path}.json`);
    } else {
      [path, slug] = params.slug;
      let url = `lines/${path}/${slug}.json?${query.b ? "b=1" : ''}`;
      response = await this.fetch(url);
    }
    const data = await response.json();

		if (response.status === 200 && data.success) {
      return { line : data.line, path:path}
		} else {
			this.error(response.status, data.error);
		}
	}
</script>

<script lang="ts">
  import Line from "../../components/Line.svelte";
  export let line: { title:string, path: string, byline:string, sha:string, branch:string, slug:string, userid:string, editable:boolean, entries: []};
  export let path;
</script>

<svelte:head>
	<title>{line.title}</title>
  <meta name="title" content={line.title}/>
  <meta name="description" content="A Scryline timeline"/>
  <meta property="og:title" content={line.title}>
  <meta property="og:description" content="A Scryline timeline"/>
  <meta property="og:url" content="https://scryline.com/{path}/{line.slug}"/>
  <meta name="twitter:title" content={line.title}>
  <meta name="twitter:description" content="A Scryline timeline"/>
</svelte:head>

<div class="page">
  <Line {line}/>
</div>
