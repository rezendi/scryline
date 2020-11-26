<script lang="ts">
    import type Entry from './Entry.js';
    export let entry: Entry, userEditable:boolean;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    const doDelete = (event) => dispatch('delete', { id: event.target.getAttribute("data-entry-id")} );

    import { getContext } from 'svelte';
    const { open } = getContext('simple-modal');
    import EditBox from './EditBox.svelte';

    function doCommentary() {
      open (
        EditBox,
        {
          initialComments: entry.comments,
          initialChapter: entry.chapter,
          initialTags: entry.tags,
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
	
  	const onOK = (vals) => {
      if (vals.insert) {
        dispatch("insertCommentsAfter", { id: entry.id, comments: vals.comments } );
      } else {
        entry.comments = vals.comments;
      }
      entry.chapter = vals.chapter;
      entry.tags = vals.tags;
      dispatch("refresh");
    }

    let showingEmbed = false;
    import { onMount } from 'svelte';
    onMount(async () => {
      if (entry.url.startsWith("https://twitter.com/")) {
        let twitter_id = entry.url.split("/").splice(-1)[0];
        window.twttr.widgets.createTweet(twitter_id, document.getElementById("entry_content_"+entry.id))
        .then(res => {
          console.log("tweet added "+twitter_id);
          if (!res) { throw new Error("tweet not added"); }
          showingEmbed = true;
        }).catch(err => {
          console.log("tweet error", err);
        });
      }
      else if (entry.url.startsWith("https://www.youtube.com/")) {
        let youtube_id = entry.url.split("v=").splice(-1)[0];
        youtube_id = youtube_id.split("&")[0];
        let newHTML = `<div class="youtube-player" data-id="${youtube_id}"></div>`;
        let summary = document.getElementById("entry_summary_"+entry.id)
        summary.innerHTML = summary.innerHTML + newHTML;
        console.log("youtube added "+youtube_id);
        showPlayers();
      }
    });

    function getTitle() {
      return entry.title ? entry.title.replace(` | ${entry.source}`, "") : entry.url;
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

.card_title {
  font-size: large;
  text-decoration: none;
  font-weight:bold;
  user-select:text;
}
  
.card_main {
  margin-top: .5rem;
  display:flex;
  padding: 0.25rem;
  align-items:center;
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
  user-select:text;
}

.card_source {
  font-style:italic;
  user-select: text;
}

.card_labels {
  display:flex;
  flex-direction:column;
  align-content: flex-end;
  justify-content: flex-end;
  flex-wrap: wrap;
  flex: 2;
}

.card_label{
  display: inline-flex;
  padding: 0.1rem 1.25rem 0.1rem;
  margin: .15rem 0rem 0.15rem;
  background-color: #f0f0f0;
  font-size: .75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: currentColor;
  user-select: text;
}

.card_summary {
  font-style:italic;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
}

.card_commentary {
  border-top:1px black;
  padding-bottom:5px;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
}

.comment_button {
  float:right;
  border: 0;
  background-color: #fff;
  margin-right: -22px;
  margin-bottom: 0px;
}

</style>

<div class="timeline_card card" id="entry_{entry.id}">
    {#if userEditable}
      <button class="hide_button" data-entry-id={entry.id} on:click={doDelete}>X</button>
    {/if}
    <div class="card_inherent_content" id="entry_content_{entry.id}">
      {#if !showingEmbed}
        {#if entry.title || entry.tags || entry.url}
          <header class="card_header">
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
            <div class="spacer">&nbsp;</div>
            <div class="card_labels">
              {#each entry.tags.split(",") as tag}
                <span class="card_label">{tag}</span>
              {/each}
            </div>
          </div>
        {/if}
        {#if entry.summary}
          <div id="entry_summary_{entry.id}" class="card_summary">{entry.summary}</div>
          <hr/>
        {/if}
      {/if}
    </div>
    <div class="card_commentary">
      {@html entry.comments}
      {#if userEditable}
        <button class="comment_button" on:click={doCommentary}>+</button>
      {/if}
    </div>
  </div>
