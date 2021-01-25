<script lang="ts">
  import { flip } from 'svelte/animate';
  import Modal from 'svelte-simple-modal';
  import Entry from './Entry';
  import Card from "./Card.svelte";
  import util from "./util";
  
  // TODO maintain a separate "status" for the line and key behavior on that, as this all is getting complex

  export let line: { title:string, sha:string, path:string, branch:string, userid:string, byline:string, editable:boolean, entries: Entry[]};
  let versions:string[] = [JSON.stringify(line)], redoVersions:string[] = [];
  let originalTitle = line.title;

  import { stores } from '@sapper/app';
  const { page, session } = stores();
  let usersLine = !line.userid || line.userid == $session.sUser.uid;
  let userEditable = usersLine || line.editable;
  session.subscribe(value => {
    usersLine = !line.userid || line.userid == $session.sUser.uid;
    userEditable = usersLine || line.editable;
  });
 
  /* adding */
  let oldUrl: string = '';
  let newUrl: string = '';

  // set forked IDs negative to distinguish them
  const nextId = function () {
    let ids = line.entries.map(entry => entry.id);
    let maxId = ids.reduce((a,b) => {return Math.abs(a) < Math.abs(b) ? Math.abs(b) : Math.abs(a)}, 0);
    return line.branch ? (-1 - maxId) : maxId + 1;
  }

  const refresh = function() {
    let newEntries = line.entries;
    line.entries = newEntries;
    invalidate();
  }

  const doDisable = function(elId, disableIt) {
    let el = document.getElementById(elId);
    if (el) {
      if (disableIt) {
        el.setAttribute("disabled", "true");
      } else {
        el.removeAttribute("disabled");
      }
    }
  }

  const doShow = (elId) => {
    let el = document.getElementById(elId);
    el ? el.style.display="block" : null;
  }

  const doHide = (elId) => {
    let el = document.getElementById(elId);
    el ? el.style.display="none" : null;
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
    doHide("restoreLocalVersion");
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
      let entries = line.entries;
      let reversed = entries.length > 0 && util.parseDate(entries[0].when) > util.parseDate(entries[entries.length-1].when)
      entries.unshift(newEntry);
      line.entries = entries;
      sortList();
      if (reversed) reverseList();
      newUrl = '';
      setTimeout(() => {
        document.getElementById(`entry_${newEntry.id}`).scrollIntoView();
      }, 1000);
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
      return util.parseDate(a.when) > util.parseDate(b.when) ? 1 : -1
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

  const deleteLine = async () => {
    if (confirm("Are you totally sure you want to delete this timeline?")) {
      if (confirm("Are you really sure?")) {
        let response = await fetch('/save.json', {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(line)
        });
        let json = await response.json();
        if (json.success) {
          window.location.href = "/lines";
        } else {
          console.log("delete error", json);
          alert("Delete error!");
        }
      }
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
    line["email"] = $session.sUser.email;
    line.userid = $session.sUser.uid;
    line.byline = $session.sUser.name;
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
    doShow("lineTitle");
    doHide("lineTitleInput");

    localStorage.removeItem("latestLine");
  }

  const editTitle = async () => {
    doHide("lineTitle");
    doShow("lineTitleInput");
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

  const goToRepo = async () => {
    // note that this is a GET
    let url = `/save.json?title=${encodeURI(line.title)}&uid=${line.userid}&b=${line.branch}`
    let response = await fetch(url);
    let json = await response.json();
    if (json.url) {
      window.location.href = json.url;
    }
  }

  const goToOriginal = () => {
    let originalUrl = window.location.href.split('?')[0];
    window.location.href = originalUrl;
  }

  const forkRepo = async () => {
    let response = await fetch('/fork.json', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({title:line.title, uid:line.userid, line:line})
    });
    let json = await response.json();
    if (json.url || json.existing) {
      window.location.href = "/my";
    }
  }

  const getChapterFor = (idx) => {
    if (idx < 0) {
      return '';
    }
    for (var j=idx; j>=0; j--) {
      if (line.entries[j].chapter) {
        return line.entries[j].chapter;
      }
    }
    return '';
  }

  const doChapter = (event, entry:Entry) => {
    event.preventDefault();
    let text = event.target.innerHTML;
    let closing:boolean = !event.target.style.textDecoration;
    let doMethod = closing ? doHide : doShow;
    let inTargetChapter = false;
    line.entries.forEach((lineEntry) => {
        if (lineEntry.chapter) {
          // changes only when not empty
          inTargetChapter = lineEntry.chapter == entry.chapter;
          if (inTargetChapter) {
            return doMethod(`entry_${lineEntry.id}`);
          }
        }
        if (inTargetChapter) {
          doMethod(`element_${lineEntry.id}`);
        }
    });
    event.target.style.textDecoration = closing ? "underline" : "";
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
        doShow("restoreLocalVersion");
      }
    }

    // if a timeline has 32 or more entries and 4 or more chapters, show the first 2 and hide the rest
    if (line.entries.length >= 32 && !$page.query.showAll) {
      let chapters = [];
      line.entries.forEach((e) => {
        if (e.chapter && ! chapters.includes(e.chapter)) {
          chapters.push({id:e.id, chapter:e.chapter});
        }
      }) 
      if ( chapters.length >= 4) {
        chapters.shift();
        chapters.shift();
        chapters.forEach((c) => {
          document.getElementById("chapter-link-"+c.id).click();
        })
      };
    }
  });
</script>

<style>
.timeline_header {
  display:flex;
  justify-content:space-between;
  background-color: #f0f0f0;
  z-index: 1;
}

.author_header {
  display:flex;
  align-content: center;
  width:100%;
  position: -webkit-sticky;
  position: sticky;
  top: 0px;
}

.author_button {
  padding: 0px 3px;
  margin: 0px 2px;
  border-width: 1px;
  height: 2.2rem;
  font-size: 16px;
}

#adder {
  margin-left:2px;
  padding:0.5rem;
  margin-bottom:0.25rem;
}

#lineTitle {
  font-weight:bold;
  font-size:20px;
}

#lineTitleInput {
  display:none;
}
</style>

{#if usersLine}
  <div class="author_header timeline_header">
    <span id="lineTitle">
      {line.title}
      <button style="border:0" on:click={editTitle}>✏️</button>
    </span>
    <input id="lineTitleInput" on:change={invalidate} bind:value={line.title} size="40" placeholder="Title"/>
    <span class="spacer">&nbsp;</span>
    <button class="author_button" id="restoreLocalVersion" style="display:none;" on:click={restoreLocalVersion}>Restore</button>
    <span class="spacer">&nbsp;</span>
    <button class="author_button" id="saveLine" on:click={save} disabled>Save</button>
    <span class="spacer">&nbsp;</span>
    <button class="author_button" id="undo" on:click={undo} disabled>Undo</button>
    <button class="author_button" id="redo" on:click={redo} disabled>Redo</button>
    <span class="spacer">&nbsp;</span>
    <button class="author_button" on:click={sortList} disabled={line.entries.length<2}>Sort</button>
    <button class="author_button" on:click={reverseList} disabled={line.entries.length<2}>Reverse</button>
    <input id="adder" placeholder="Add URLs here" name="url" size="40" bind:value={newUrl} on:change={addUrl} on:input={urlChanged}/>
  </div>
{:else}
  <div class="timeline_header">
    <span id="lineTitle">{line.title} by {line.byline}</span>
    <button on:click={reverseList} disabled={line.entries.length<2}>Reverse</button>
  </div>
{/if}

<Modal>
  <div class="timeline">
    <div class="timeline_cards">
      {#each line.entries as entry, i (entry.id)}
        <div id="element_{entry.id}" class="timeline_element"
          animate:flip="{{duration: 800}}"
          class:is-active={hovering === i}
          draggable={true}
          on:mousedown={event => mousedown=event.target}
          on:dragstart={event => dragStart(event, i)}
          on:drop|preventDefault={event => drop(event, i)}
          on:dragenter={() => hovering = i}
          ondragover="return false"
        >
          {#if getChapterFor(i) != getChapterFor(i-1)}
            <a class="timeline_chapter" id="chapter-link-{entry.id}" href="{$page.path}#chapter-link-{entry.id}" on:click={(event) => doChapter(event, entry)}>{entry.chapter}</a>
          {/if}
          <Card entry={entry} own={usersLine} editable={userEditable} on:refresh={refresh} on:delete={deleteEntry} on:insertCommentsAfter={insertCommentsAfter}/>
        </div>
      {/each}
    </div>
  </div>
</Modal> 

<button on:click={goToRepo}>View raw data on GitHub</button>
{#if line.branch}
  <button on:click={goToOriginal}>Go to original timeline</button>
  <button on:click={goToOriginal}>Submit Changes</button>
{/if}
{#if usersLine}
  <button id="deleteLine" style="float:right;" on:click={deleteLine}>Delete This {line.branch ? "Fork" : "Timeline"}</button>
{:else}
  <button style="float:right;" on:click={forkRepo}>Fork this repo</button>
{/if}
