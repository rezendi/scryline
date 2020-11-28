<script lang="ts">
  import { flip } from 'svelte/animate';
  import Modal from 'svelte-simple-modal';
  import Entry from './Entry';
  import Card from "./Card.svelte";
  import util from "./util";
  
  export let line: { title:string, sha:string, userid:string, editable:boolean, entries: Entry[]};
  let versions:string[] = [JSON.stringify(line)], redoVersions:string[] = [];
  let originalTitle = line.title;

  import { stores } from '@sapper/app';
  const { session } = stores();
  let usersLine = !line.userid || line.userid == $session.user.uid;
  let userEditable = usersLine || line.editable;
  session.subscribe(value => {
    usersLine = !line.userid || line.userid == $session.user.uid;
    userEditable = usersLine || line.editable;
  });
 
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

  const doDisable = function(elId, disableIt) {
    if (disableIt) {
      document.getElementById(elId).setAttribute("disabled", "true");
    } else {
      document.getElementById(elId).removeAttribute("disabled");
    }
  }

  const invalidate = function() {
    let newVersion = JSON.stringify(line);
    if (versions.length==0 || newVersion != versions[versions.length-1]) {
      localStorage.setItem("latestLine", newVersion);
      versions.push(newVersion);
      redoVersions=[];
      doDisable("undo", versions.length < 2);
      doDisable("redo", true);
    }
    // console.log("versions", versions);
    document.getElementById("restoreLocalVersion").style.display="none";
    doDisable("saveLine", false);
  }

  const undo = function() {
    if (versions.length<2) {
      return;
    }
    let currentVersion = versions.pop();
    if (redoVersions.length==0 || currentVersion != redoVersions[redoVersions.length-1]) {
      redoVersions.push(currentVersion);
      doDisable("redo", false);
      doDisable("saveLine", false);
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
      doDisable("undo", false);
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
      return util.parseDate(a.when) < util.parseDate(b.when) ? 1 : -1
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
    console.log("saving");
    if (!line.title || line.title.trim().length==0) {
      return alert("A timeline must have a title to be saved.");
    }
    if (!usersLine) {
      return alert("You didn't create this timeline.");
    }
    let doRename = originalTitle && originalTitle != line.title;
    if (doRename) {
      if (!confirm(`Are you sure you want to change the title from "${originalTitle}"? This will likely change this timeline's URL and break previous links to it!`)) {
        return;
      }
      line['originalTitle'] = originalTitle;
    }

    // OK, we're actually going to save it
    line['email'] = $session.user.email; // to be hashed to path
    line.userid = $session.user.uid;
    line.editable = false; // TODO make this configurable
    let response = await fetch('/save.json', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(line)
    });
    let json = await response.json();
    if (json.success===false) {
      console.log("save error", json);
      let message = "Save error!";
      if (typeof json.error == "string" && json.error.startsWith("Invalid request")) {
        message = "Save error; you may already be using this title for another timeline?";
      }
      alert(message);
      return;
    }
    if (doRename) {
      console.log("moving");
      window.location.href = `/lines/${json.path}/${json.content.name.split(".")[0]}`;
    }
    line.sha = json.content.sha;
    originalTitle = line.title;
    delete line['email'];
    delete line['originalTitle'];
    document.getElementById("saveLine").setAttribute("disabled","true");
    document.getElementById("lineTitle").style.display="block";
    document.getElementById("lineTitleInput").style.display="none";
    localStorage.removeItem("latestLine");
  }

  const editTitle = async () => {
    document.getElementById("lineTitle").style.display="none";
    document.getElementById("lineTitleInput").style.display="block";
  }

  const restoreLocalVersion = () => {
      let storedLine = JSON.parse(localStorage.getItem("latestLine"));
      localStorage.removeItem("latestLine");
      line = storedLine;
      invalidate();
  }

  /* drag and drop */

  let hovering = -1;
  let mousedown = null;

  const drop = (event, target) => {
      console.log("drop");
      event.dataTransfer.dropEffect = 'move'; 
      const start = parseInt(event.dataTransfer.getData("text/plain"));
      const newList = line.entries;
      if (start==target || !userEditable) {
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

  /* on mount */
  import { onMount } from 'svelte';
  onMount(async () => {
    if (!line.title) {
      editTitle();
    }
    if (localStorage.hasOwnProperty("latestLine")) {
      let storedLine = JSON.parse(localStorage.getItem("latestLine"));
      if (storedLine.userid == line.userid && storedLine.slug == line.title) {
        document.getElementById("restoreLocalVersion").style.display="block";
      }
    }
  });
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
  align-content: center;
  justify-content: center;
  border-top: 1px solid gray;
  padding-top: 0.3rem;
}

.adder {
  margin-left:auto;
  padding:0.5rem;
  margin-bottom:0.25rem;
}

#lineTitleInput {
  display:none;
}
</style>

<Modal>
  <div class="entry_header">
    {#if usersLine}
      <div class="author_header">
        <input class="adder" placeholder="Add URLs here" name="url" size="60" bind:value={newUrl} on:change={addUrl} on:input={urlChanged}/>
        <div class="author_title">
          <span id="lineTitle">
            <b>{line.title}</b>
            <button style="border:0" on:click={editTitle}>✏️</button>
          </span>
          <input id="lineTitleInput" on:change={invalidate} bind:value={line.title} size="40" placeholder="Title"/>
          <span class="spacer">&nbsp;</span>
          <button id="restoreLocalVersion" style="display:none;" on:click={restoreLocalVersion}>Restore Local Save</button>
          <span class="spacer">&nbsp;</span>
          <button on:click={sortList} disabled={line.entries.length<2}>Sort</button>
          |
          <button on:click={reverseList} disabled={line.entries.length<2}>Reverse</button>
          |
          <button id="undo" on:click={undo} disabled>Undo</button>
          |
          <button id="redo" on:click={redo} disabled>Redo</button>
          |
          <button id="saveLine" on:click={save} disabled>Save</button>
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
            <Card entry={entry} own={usersLine} editable={userEditable} on:refresh={refresh} on:delete={deleteEntry} on:insertCommentsAfter={insertCommentsAfter}/>
          </div>
        {/each}
      </div>
    </div>
  </Modal> 
