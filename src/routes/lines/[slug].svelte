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
  import { flip } from 'svelte/animate';
  import Card from "../../components/Card.svelte";
  import chrono from 'chrono-node';
  import Modal from 'svelte-simple-modal';
  
  let hovering = -1;

  export let line: { id:number, slug:string, title:string, sha:string, entries: {
    id: number,
    originalUrl?: string,
    url?: string,
    when?: string,
    author?: string,
    source?: string,
    logo?: string,
    image?: string,
    title?: string,
    summary?: string,
    comments?: string
    tags?: string,
    chapter?: string,
  }[]};

  /* drag and drop */

  const drop = (event, target) => {
    console.log("drop");
      event.dataTransfer.dropEffect = 'move'; 
      const start = parseInt(event.dataTransfer.getData("text/plain"));
      const newList = line.entries;

      if (start < target) {
        newList.splice(target + 1, 0, newList[start]);
        newList.splice(start, 1);
      } else {
        newList.splice(target, 0, newList[start]);
        newList.splice(start + 1, 1);
      }
      line.entries = newList
      hovering = null
  }

  const dragStart = (event, i) => {
    console.log("drag");
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.dropEffect = 'move';
      const start = i;
      event.dataTransfer.setData('text/plain', start);
  }

  /* adding */
  let oldUrl: string = '';
  let newUrl: string = '';

  const addUrl = async () => {
      let existing = line.entries.filter(entry => entry.url==newUrl);
      if (newUrl.trim().length < 8 || existing.length > 0) {
        return;
      }
      let ids = line.entries.map(entry => entry.id);
      let maxId = ids.reduce((a,b) => {return a < b ? b : a}, 0);
      console.log("fetching", newUrl);
      let response = await fetch('/pager.json', {
        headers: { "X-URL": newUrl },
      });
      let metadata = await response.json();
      let newEntry = { id: maxId + 1, ...metadata };
      console.log("got", newEntry);
      const newList = line.entries;
      newList.unshift(newEntry);
      line.entries = newList;
      newUrl = '';
      sortList();
  }

  const urlChanged = () => {
      if (Math.abs(newUrl.length - oldUrl.length) > 1) {
          addUrl();
      }
      oldUrl = newUrl;
  }

  const sortList = () => {
    let newList = line.entries;
    line.entries= newList.sort((a,b) => {
      if (a.when=="" || b.when=="") {
        return 0;
      }
      return chrono.parseDate(a.when) < chrono.parseDate(b.when) ? 1 : -1
    });
  }

  /* deleting */

  const deleteEntry = (event) => {
    if (confirm("Are you sure you want to delete this card?")) {
      console.log("target", event.detail.id);
      const toDelete = event.detail.id;
      const newList = line.entries.filter(e => `${e.id}` !== toDelete);
      line.entries = newList;
    }
  }

  const save = async () => {
    console.log("save");
    let response = await fetch('/save.json', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(line)
    });
    let json = await response.json();
  }
</script>

<style>
.page{
  max-width: 47rem;
  padding: 1rem 2rem 3rem;
  margin-left: auto;
  margin-right: auto;
}

.header {
  display:flex;
  justify-content:flex-end;
}
</style>

<svelte:head>
	<title>{line.title}</title>
</svelte:head>

<Modal>
  <div class="page">
    <button on:click={save}>Save</button>
    <input bind:value={line.title} placeholder="Title"/>
    <div class="header">
      <input class="adder" name="url" size="60" bind:value={newUrl} on:change={addUrl} on:input={urlChanged}/>
    </div>
    <div class="timeline">
      <div class="timeline_cards">
        {#each line.entries as entry, i (entry.id)}
          <div class="timeline_element"
            animate:flip
            class:is-active={hovering === i}
            draggable={true}
            on:dragstart={event => dragStart(event, i)}
            on:drop|preventDefault={event => drop(event, i)}
            on:dragenter={() => hovering = i}
            ondragover="return false"
          >
            {#if i==0 || entry.chapter != line.entries[i-1].chapter}
              <div class="timeline_chapter card_label">{entry.chapter}</div>
            {/if}
            <Card entry={entry} on:delete={deleteEntry}/>
          </div>
        {/each}
      </div>
    </div>
  </div>
</Modal>