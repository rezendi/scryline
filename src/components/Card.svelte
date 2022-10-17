<script lang="ts">
    import util from "./util";
    import type Entry from './Entry.js';
    export let entry: Entry, own:boolean, editable:boolean;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    const doDelete = (event) => dispatch('delete', { id: event.target.getAttribute("data-entry-id")} );

    import { stores } from '@sapper/app';
    const { page, session } = stores();
    let userid = $session.sUser.uid;
    let hasComments = entry.comments ? entry.comments.replace(/(<([^>]+)>)/gi, "").trim().length > 0 : false;

    function getMySuggestions() {
      try {
        let suggestions = JSON.parse(entry.suggestions ? entry.suggestions : '{}');
        return suggestions[userid] ? suggestions[userid] : '';
      } catch(error) {
        console.log("suggestions JSON error", error);
        return '';
      }
    }

    import { getContext } from 'svelte';
    const { open } = getContext('simple-modal');
    import EditBox from './EditBox.svelte';

    function doCommentary() {
      open (
        EditBox,
        {
          initialComments: own ? entry.comments : getMySuggestions(),
          initialChapter: entry.chapter,
          initialTags: entry.tags,
          initialDateTime: entry.when,
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
      } else if (own) {
        entry.comments = vals.comments;
      } else {
        let suggestions = JSON.parse(entry.suggestions ? entry.suggestions : '{}');
        entry.suggestions = JSON.stringify ({ suggestions, ...{ userid: vals.comments}});
      }
      entry.chapter = vals.chapter;
      entry.tags = vals.tags;
      if (vals.dateTime) {
        if (!entry.originalWhen) {
          entry.originalWhen = entry.when && entry.url ? entry.when : '';
        }
        entry.when = vals.dateTime;
      }
      hasComments = entry.comments ? entry.comments.replace(/(<([^>]+)>)/gi, "").trim().length > 0 : false;
      console.log("entry.when", entry.when);
      dispatch("refresh");
    }

    let showingEmbed = false;
    import { onMount } from 'svelte';
    onMount(async () => {
      if (entry.url.startsWith("https://twitter.com/")) {
        let twitter_id = entry.url.split("/").splice(-1)[0];
        let twitter_options = { conversation:'none', dnt:true };
        window.twttr.widgets.createTweet(twitter_id, document.getElementById("entry_content_"+entry.id), twitter_options)
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
      if (entry.title) {
        return entry.title.replace(` | ${entry.source}`, "");
      }
      let url = new URL(entry.url);
      let displayPath = url.pathname.substring(1,1+url.pathname.slice(1).indexOf("/"));
      return `${url.hostname}/${displayPath}`;
    }


    </script>

<style>
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

.card_when a {
  text-decoration: none;
}

.card_originalWhen {
  color: gray;
  user-select: none;
}

.card_source {
  font-style: italic;
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
  font-size:smaller;
}

.card_commentary {
  border-top:1px black;
  padding-bottom:5px;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
}

.upper_controls {
  float:right;
  margin: 0px;
  padding: 0px;
  margin-right: -10px;
  margin-top: -18px;
}

</style>

<div class="timeline_card card" id="entry_{entry.id}">
    <div class="upper_controls">
      {#if editable}
        <span class="close" data-entry-id={entry.id} on:click={doDelete} on:keyup={doDelete}></span>
      {/if}
    </div>
    <div class="card_inherent_content" id="entry_content_{entry.id}">
      {#if !showingEmbed}
        {#if entry.title || entry.tags || entry.url}
          <header class="card_header">
            <a class="card_title" href="{entry.url}">{@html getTitle()}</a>
          </header>
        {/if}
        {#if entry.image || entry.author || entry.source || entry.when}
          <div class="card_main">
            {#if entry.image}
              <div class="card_image">
                <a href="{entry.url}"><img src="{entry.image}" alt={entry.title} height="auto" width="120"/></a>        
              </div>
            {/if}
            <div class="card_info">
              <span class="card_author">{@html entry.author}</span>
              <span class="card_source">{@html entry.source}</span>
              <span class="card_when">
                <a href="{$page.path}#entry_{entry.id}">{util.formatDateString(entry.when)}</a>
                {#if entry.originalWhen}
                  <span class="card_originalWhen" title="Originally parsed as {util.formatDateString(entry.originalWhen)}">(*)</span>
                {/if}
              </span>
            </div>
            <div class="spacer"></div>
            <div class="card_labels">
              {#if entry.tags}
                {#each entry.tags.split(",") as tag}
                  <span class="card_label">{tag}</span>
                {/each}
              {/if}
            </div>
          </div>
        {/if}
        {#if entry.summary}
          <div id="entry_summary_{entry.id}" class="card_summary">{@html entry.summary}</div>
        {/if}
      {/if}
    </div>
    <hr style="{hasComments && (entry.summary || entry.url) ? 'display:block;' : 'display:none;'}"/>
    <div class="comments_container" style="{hasComments ? 'display:block;' : 'display:none;'}">
      <div class="card_commentary">
          {@html entry.comments}
        </div>
    </div>
    {#if editable}
      <span class="add_button" style="float:right; margin-right:-10px;" on:click={doCommentary} on:keyup={doCommentary}></span>
    {/if}
  </div>
