<script lang="ts">
  import { flip } from 'svelte/animate';
  import Entry from './Entry.js';
  import Card from "./Card.svelte";
  import chrono from 'chrono-node';
  import Modal from 'svelte-simple-modal';
  
  export let line: { title:string, slug:string, sha:string, entries: Entry[]};
  let versions:string[] = [JSON.stringify(line)], redoVersions:string[] = [];

  import { stores } from '@sapper/app';
	const { session } = stores();
 
  /* drag and drop */

  let hovering = -1;
  let mousedown = null;

  const drop = (event, target) => {
      console.log("drop");
      event.dataTransfer.dropEffect = 'move'; 
      const start = parseInt(event.dataTransfer.getData("text/plain"));
      const newList = line.entries;
      if (start==target) {
        console.log("no change");
        return;
      }

      if (start < target) {
        newList.splice(target + 1, 0, newList[start]);
        newList.splice(start, 1);
      } else {
        newList.splice(target, 0, newList[start]);
        newList.splice(start + 1, 1);
      }
      line.entries = newList;
      mousedown = null;
      hovering = -1;
      invalidate();
  }

  let noDragElements = ["card_label", "card_title", "card_author", "card_source", "card_when", "card_summary", "card_commentary"];
  const dragStart = (event, i) => {
      console.log("drag", mousedown.className);
      if (noDragElements.includes(mousedown.className)) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.dropEffect = 'move';
      const start = i;
      event.dataTransfer.setData('text/plain', start);
  }

  /* adding */
  let oldUrl: string = '';
  let newUrl: string = '';

  const nextId = function () {
    let ids = line.entries.map(entry => entry.id);
    let maxId = ids.reduce((a,b) => {return a < b ? b : a}, 0);
    return maxId + 1;
  }

  const refresh = function() {
    let newEntries = line.entries;
    line.entries = newEntries;
    invalidate();
  }

  const invalidate = function() {
    let newVersion = JSON.stringify(line);
    if (versions.length==0 || newVersion != versions[versions.length-1]) {
      versions.push(newVersion);
      redoVersions=[];
    }
    // console.log("versions", versions);
    document.getElementById("saveLine").removeAttribute("disabled");
  }

  const undo = function() {
    if (versions.length<2) {
      return;
    }
    let currentVersion = versions.pop();
    if (redoVersions.length==0 || currentVersion != redoVersions[redoVersions.length-1]) {
      redoVersions.push(currentVersion);
    }
    let newLine = versions[versions.length-1];
    line = JSON.parse(newLine);
  }

  const redo = function() {
    if (redoVersions.length==0) {
      return;
    }
    let currentVersion = JSON.stringify(line);
    if (versions.length==0 || currentVersion != versions[versions.length-1]) {
      versions.push(currentVersion);
    }
    line = JSON.parse(redoVersions.pop());
  }

  const addUrl = async () => {
      let existing = line.entries.filter(entry => entry.url==newUrl);
      if (newUrl.trim().length < 8 || existing.length > 0) {
        return;
      }
      console.log("fetching", newUrl);
      let response = await fetch('/pager.json', { headers: { "X-URL": newUrl }, });
      let metadata = await response.json();
      if (metadata.success===false) {
        console.log("add error", metadata.error);
        alert("Error adding this URL");
        return;
      }
      let newEntry = new Entry({ id: nextId(), ...metadata });
      console.log("got", newEntry);
      let newEntries = line.entries;
      newEntries.unshift(newEntry);
      line.entries = newEntries;
      invalidate();
      sortList();
      newUrl = '';
  }

  const urlChanged = () => {
      if (Math.abs(newUrl.length - oldUrl.length) > 1) {
          addUrl();
      }
      oldUrl = newUrl;
  }

  const getAtemporal = () => {
    let atemporal = [];
    for (let i=0; i<line.entries.length; i++) {
        if (!line.entries[i].when) {
            let a = { entry: line.entries[i], previousId: i==0 ? -1 : line.entries[i-1].id }
            atemporal.push(a);
        }
    }
    return atemporal;
  }

  const sortList = () => {
    let temporal = line.entries.filter(a => a.when.length > 0);
    let sorted = temporal.sort((a,b) => {
      if (a.when=="" || b.when=="") {
        return 0;
      }
      return chrono.parseDate(a.when) < chrono.parseDate(b.when) ? 1 : -1
    });
    for (const f of getAtemporal()) {
        let idx = sorted.findIndex(a => f.previousId == a.id);
        sorted.splice(idx+1, 0, f.entry);
    }
    line.entries = sorted;
    invalidate();
  }

  const reverseList = () => {
    line.entries = line.entries.reverse();
    invalidate();
  }

  /* deleting */

  const deleteEntry = (event) => {
    if (confirm("Are you sure you want to delete this card?")) {
      const toDelete = event.detail.id;
      const newList = line.entries.filter(e => `${e.id}` !== toDelete);
      line.entries = newList;
      invalidate();
    }
  }

  /* inserting */
  const insertCommentsAfter = (event) => {
    console.log("detail", event.detail);
    let index = line.entries.findIndex(a => { return a.id == event.detail.id});
    let newEntry = new Entry({ id: nextId(), previousId: event.detail.id, comments: event.detail.comments });
    console.log("newEntry", newEntry);
    let newEntries = line.entries;
    newEntries.splice(index+1, 0, newEntry);
    line.entries = newEntries;
    invalidate();
  }

  /* save */
  const save = async () => {
    if (!line.title || line.title.trim().length==0) {
      alert("A timeline must have a title to be saved.");
      return;
    }
    console.log("save");
    let response = await fetch('/save.json', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(line)
    });
    let json = await response.json();
    if (json.success===false) {
      console.log("save error", json.error);
      alert("Save error!");
      return;
    }
    line.sha = json.content.sha;
    document.getElementById("saveLine").setAttribute("disabled","true");
  }

</script>

<style>
.entry_header {
  display:flex;
  justify-content:space-between;
}

.author_header {
  display:flex;
  flex-direction: column;
  align-content: right;
  width:100%;
}

.author_title {
  display:flex;
}

.adder {
  margin-left:auto;
  padding:0.5rem;
  margin-bottom:0.25rem;
}
</style>

<Modal>
  <div class="entry_header">
    {#if $session.user}
      <div class="author_header">
        <input class="adder" placeholder="Add URLs here" name="url" size="60" bind:value={newUrl} on:change={addUrl} on:input={urlChanged}/>
        <div class="author_title">
          <b>Title</b>
          <input id="lineTitle" bind:value={line.title} size="40" placeholder="Title"/>
          <button id="saveLine" on:click={save} disabled>Save</button>
          <span style="flex:2;">&nbsp;</span>
          <button on:click={sortList} disabled={line.entries.length<2}>Sort</button>
          <button on:click={reverseList} disabled={line.entries.length<2}>Reverse</button>
          <button on:click={undo}>Undo</button>
          <button on:click={redo}>Redo</button>
        </div>
      </div>
    {:else}
      <b>Timeline: {line.title}</b>
      <button on:click={reverseList} disabled={line.entries.length<2}>Reverse</button>
    {/if}
    </div>
  <div class="timeline">
      <div class="timeline_cards">
        {#each line.entries as entry, i (entry.id)}
          <div class="timeline_element"
            animate:flip="{{duration: 800}}"
            class:is-active={hovering === i}
            draggable={true}
            on:mousedown={event => mousedown=event.target}
            on:dragstart={event => dragStart(event, i)}
            on:drop|preventDefault={event => drop(event, i)}
            on:dragenter={() => hovering = i}
            ondragover="return false"
          >
            {#if entry.chapter && (i==0 || entry.chapter != line.entries[i-1].chapter)}
              <div class="timeline_chapter">{entry.chapter}</div>
            {/if}
            <Card entry={entry} on:refresh={refresh} on:delete={deleteEntry} on:insertCommentsAfter={insertCommentsAfter}/>
          </div>
        {/each}
      </div>
    </div>
  </Modal> 
