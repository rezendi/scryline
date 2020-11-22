<script lang="ts">
    import type Entry from './Entry.js';
    export let entry: Entry;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    const doDelete = (event) => dispatch('delete', { id: event.target.getAttribute("data-entry-id")} );

    function getTitle() {
      return entry.title ? entry.title.replace(` | ${entry.source}`, "") : entry.url;
    }

    import { getContext } from 'svelte';
    const { open } = getContext('simple-modal');
    import Comment from './Comment.svelte';

    function doCommentary() {
      open (
        Comment,
        {
          initialComments: entry.comments,
          onCancel,
          onOK
        },
        {
          closeButton: false,
          closeOnOuterClick: false,
        }
      );
    }

    const onCancel = (text, inline) => {
      entry.comments = entry.comments;
    }
	
  	const onOK = (text, insert) => {
      if (insert) {
        dispatch("insertCommentsAfter", { id: entry.id, comments: text } );
      } else {
        entry.comments = text;
      }
    }
  </script>

<style>
.hide_button {
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

.card_commentary {
  border-top:1px black;
  padding-bottom:5px;
}

.comment_button {
  float:right;
  border: 0;
  background-color: #fff;
  margin-right: -22px;
  margin-bottom: 0px;
}

</style>

<div class="timeline_card card">
    <button class="hide_button" data-entry-id={entry.id} on:click={doDelete}>X</button>
    {#if entry.title || entry.tags || entry.url}
      <header class="card_header">
        {#if entry.tags}<div class="card_label">{entry.tags}</div>{/if}
        <a class="card_title" href="{entry.url}">{getTitle()}</a>
      </header>
    {/if}
    {#if entry.image || entry.author || entry.source || entry.when}
      <div class="card_main">
        {#if entry.image}
          <div class="card_image" title="{entry.originalUrl}">
            <a href="{entry.url}"><img src="{entry.image}" alt={entry.title} height="auto" width="120"/></a>        
          </div>
        {/if}
        <div class="card_info">
          <span class="card_author">{entry.author}</span>
          <span class="card_source">{entry.source}</span>
          <span class="card_when">{entry.when}</span>
        </div>
      </div>
    {/if}
    {#if entry.summary}
      <div class="card_summary">{entry.summary}</div>
      <hr/>
    {/if}
    <div class="card_commentary">
      {entry.comments}
      <button class="comment_button" on:click={doCommentary}>+</button>
    </div>
  </div>
