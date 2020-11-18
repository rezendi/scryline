<script context="module" lang="ts">
	export async function preload({ params }) {
		// the `slug` parameter is available because this file is called [slug].svelte
		const res = await this.fetch(`lines/${params.slug}.json`);
		// const data = await res.json();
		let mock = { title : "Test Timeline", entries: [
			{
				id: 1,
				group: "2008",
				label: "2 Feb",
				title: "",
				content: "Attends the Philadelphia Museum School of Industrial Art. Studies design with Alexey Brodovitch, art director at Harper's Bazaar, and works as his assistant."
			},
			{
				id: 2,
				group: "2008",
				label: "1 Sept",
				title: "The part of my life in University of Pennsylvania",
				content: "Started from University of Pennsylvania. This is an important stage of my career. Here I worked in the local magazine. The experience greatly affected me."
			},
			{
				id: 3,
				group: "2014",
				label: "July",
				title: "",
				content: "Travels to France, Italy, Spain, and Peru. After completing fashion editorial in Lima, prolongs stay to make portraits of local people in a daylight studio."
			},
			{
				id: 4,
				group: "2016",
				label: "August",
				title: "",
				content: "Upon moving to Brooklyn that summer, I began photographing weddings in Chicago."
			},
		]};
		const data = mock;

		if (res.status === 200) {
			return { line: data };
		} else {
			this.error(res.status, data.message);
		}
	}
</script>

<script lang="ts">
  import type { parse } from "path";
  import {flip} from 'svelte/animate';
  import { listen } from "svelte/internal";
  let hovering = -1;

  export let line: { title: string, entries: [{string: any }]};

  /* drag and drop */
  const drop = (event, target) => {
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
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.dropEffect = 'move';
      const start = i;
      event.dataTransfer.setData('text/plain', start);
  }

  /* adding */
  let oldUrl: string = '';
  let newUrl: string = '';

  const addUrl = () => {
      let existing = line.entries.filter(entry => entry.content==newUrl);
      if (newUrl.trim().length < 8 || existing.length > 0) {
        return;
      }
      let ids = line.entries.map(entry => entry.id);
      let maxId = ids.reduce((a,b) => {return a < b ? b : a}, 0);
      let newEntry = {
        id: maxId + 1,
        group: "",
        label: "",
        title: "",
        content: newUrl
      };
      const newList = line.entries;
      newList.unshift(newEntry);
      line.entries = newList;
      newUrl = '';
  }

  const urlChanged = () => {
      if (Math.abs(newUrl.length - oldUrl.length) > 1) {
          addUrl();
      }
      oldUrl = newUrl
  }

  const save = async () => {
    console.log("save");
    let response = await fetch('lines/save.json', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(line)
    });
    let json = await response.json();
    console.log("got", json);
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

  <div class="page">
    <button on:click={save}>Save</button>
    <div class="header">
      <input class="adder" name="url" size="60" bind:value={newUrl} on:change={addUrl} on:input={urlChanged}/>
    </div>
    <div class="timeline">
      <div class="timeline_cards">
        {#each line.entries as entry, i (entry.id)}
          <div class="timeline_element"
            animate:flip
            draggable={true}
            on:dragstart={event => dragStart(event, i)}
            on:drop|preventDefault={event => drop(event, i)}
            ondragover="return false"
            on:dragenter={() => hovering = i}
            class:is-active={hovering === i}
          >
            {#if i==0 || entry.group != line.entries[i-1].group}
              <div class="timeline_year card_label">{entry.group}</div>
            {/if}
            <div class="timeline_card card">
              <header class="card_header">
                <div class="card_label">{entry.label}</div>
                <h3 class="card_title r-title">{entry.title}</h3>
              </header>
              <div class="card_content">
                <p>{entry.content}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
