<script lang="ts">
    export let entry: {
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
    };

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    const doDelete = (event) => dispatch('delete', { id: event.target.getAttribute("data-entry-id")} );

    function getTitle() {
      return entry.title.replace(` | ${entry.source}`, "");
    }
</script>

<style>
.hide-button {
    float: right;
    border: 0;
    background-color: #fff;
    margin-top: -18px;
    margin-right: -22px;
    font-size: 11px;
    font-family:verdana;
}

.card_label{
	  display: inline-flex;
	  padding: .25rem 1.25rem .25rem;
	  background-color: #f0f0f0;
	  font-size: .75rem;
	  font-weight: 700;
	  text-transform: uppercase;
	  color: currentColor;
}

.card_main {
	  margin-top: .5rem;
    display:flex;
    padding: 0.25rem;
    align-items:center;
}

.card_title {
	  font-size: large;
    text-decoration: none;
    font-weight:bold;
}
  
.card_image {
    width:120px;
    margin-top:5px;
}

.card_info {
    display:flex;
    flex-direction:column;
    padding-left:0.25rem;
    line-height:1.5rem;
    font-size:1.1rem;
}

.card_source {
  font-style:italic;
}

.card_summary {
  font-style:italic;
}
</style>

<div class="timeline_card card">
    <button class="hide-button" data-entry-id={entry.id} on:click={doDelete}>X</button>
    <header class="card_header">
      {#if entry.tags}<div class="card_label">{entry.tags}</div>{/if}
      <a class="card_title" href="{entry.url}">{getTitle()}</a>
    </header>
    <div class="card_main">
      <div class="card_image" title="{entry.originalUrl}">
        <a href="{entry.url}"><img src="{entry.image}" alt="article hero" height="auto" width="120"/></a>        
      </div>
      <div class="card_info">
        <span class="card_author">{entry.author}</span>
        <span class="card_source">{entry.source}</span>
        <span class="card_when">{entry.when}</span>
      </div>
    </div>
    <div class="card_summary">{entry.summary}</div>
  </div>
